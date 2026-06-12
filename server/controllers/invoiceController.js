const asyncHandler = require('express-async-handler');
const Invoice = require('../models/Invoice');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const ApiError = require('../utils/ApiError');
const { renderInvoicePdf } = require('../utils/invoicePdf');
const { refreshInvoicePaymentStatus } = require('../utils/invoicePayment');

const recalc = (items, discount = 0, taxRate = 0) => {
  const subtotal = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const afterDiscount = Math.max(0, subtotal - (Number(discount) || 0));
  const tax = Math.round(afterDiscount * (Number(taxRate) || 0) / 100);
  const total = afterDiscount + tax;
  return { subtotal, tax, total };
};

const sanitizeItems = (items = []) =>
  items.map((it) => {
    const quantity = Number(it.quantity) || 1;
    const unitPrice = Number(it.unitPrice) || 0;
    return {
      description: String(it.description || '').trim(),
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
    };
  });

const idOf = (value) => (value?._id || value)?.toString();
const canManageInvoice = (req, inv) =>
  req.user.role === 'admin' ||
  (req.user.role === 'dentist' && idOf(inv.dentistId) === req.user._id.toString());
const canViewInvoice = (req, inv) =>
  canManageInvoice(req, inv) || idOf(inv.patientId) === req.user._id.toString();

// @desc    Create invoice (auto-generate from appointment if items omitted)
// @route   POST /api/invoices
const createInvoice = asyncHandler(async (req, res) => {
  const { appointmentId, items, discount = 0, taxRate = 0, notes = '' } = req.body;
  if (!appointmentId) throw new ApiError(400, 'appointmentId is required');

  const exists = await Invoice.findOne({ appointmentId });
  if (exists) throw new ApiError(400, 'Invoice already exists for this appointment');

  const appt = await Appointment.findById(appointmentId).populate('serviceId');
  if (!appt) throw new ApiError(404, 'Appointment not found');
  if (
    req.user.role === 'dentist' &&
    appt.dentistId.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'Only the assigned dentist can create this invoice');
  }

  let lineItems = sanitizeItems(items);
  if (lineItems.length === 0) {
    const service = appt.serviceId || (await Service.findById(appt.serviceId));
    const fallbackPrice = service?.priceRange?.min || 0;
    lineItems = [
      {
        description: service?.title || 'Treatment',
        quantity: 1,
        unitPrice: fallbackPrice,
        amount: fallbackPrice,
      },
    ];
  }

  const { subtotal, tax, total } = recalc(lineItems, discount, taxRate);
  const invoiceNumber = await Invoice.generateInvoiceNumber();
  const downPaymentApplied =
    appt.downPayment?.status === 'paid' ? Number(appt.downPayment.amount) || 0 : 0;

  const inv = await Invoice.create({
    invoiceNumber,
    appointmentId,
    patientId: appt.patientId,
    dentistId: appt.dentistId,
    items: lineItems,
    subtotal,
    discount,
    taxRate,
    tax,
    total,
    amountPaid: downPaymentApplied,
    downPaymentApplied,
    paymentStatus:
      downPaymentApplied >= total && total > 0
        ? 'paid'
        : downPaymentApplied > 0
          ? 'partial'
          : 'unpaid',
    paymentMethod: downPaymentApplied > 0 ? 'Midtrans DP' : '',
    paidAt: downPaymentApplied >= total && total > 0 ? new Date() : undefined,
    notes,
  });

  res.status(201).json({ success: true, data: inv });
});

// @desc    List invoices (with pagination)
// @route   GET /api/invoices
const listInvoices = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'patient') filter.patientId = req.user._id;
  else if (req.user.role === 'dentist') filter.dentistId = req.user._id;

  if (req.query.status) filter.paymentStatus = req.query.status;
  if (req.query.patientId && req.user.role === 'admin') filter.patientId = req.query.patientId;

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  const total = await Invoice.countDocuments(filter);

  const list = await Invoice.find(filter)
    .populate('patientId', 'name email phone')
    .populate('dentistId', 'name')
    .populate({ path: 'appointmentId', select: 'appointmentDate appointmentTime serviceId', populate: { path: 'serviceId', select: 'title' } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  res.json({ success: true, count: total, page, totalPages: Math.ceil(total / limit), data: list });
});

const findInvoiceForView = async (id) =>
  Invoice.findById(id)
    .populate('patientId', 'name email phone address')
    .populate('dentistId', 'name email')
    .populate({ path: 'appointmentId', select: 'appointmentDate appointmentTime serviceId diagnosis', populate: { path: 'serviceId', select: 'title' } });

// @desc    Get invoice
// @route   GET /api/invoices/:id
const getInvoice = asyncHandler(async (req, res) => {
  const inv = await findInvoiceForView(req.params.id);
  if (!inv) throw new ApiError(404, 'Invoice not found');
  if (!canViewInvoice(req, inv)) throw new ApiError(403, 'Not authorized');
  res.json({ success: true, data: inv });
});

// @desc    Update invoice (admin or assigned dentist)
// @route   PUT /api/invoices/:id
const updateInvoice = asyncHandler(async (req, res) => {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) throw new ApiError(404, 'Invoice not found');
  if (!canManageInvoice(req, inv)) throw new ApiError(403, 'Not authorized');

  if (Array.isArray(req.body.items)) inv.items = sanitizeItems(req.body.items);
  if (req.body.discount !== undefined) inv.discount = req.body.discount;
  if (req.body.taxRate !== undefined) inv.taxRate = req.body.taxRate;
  if (req.body.notes !== undefined) inv.notes = req.body.notes;

  const t = recalc(inv.items, inv.discount, inv.taxRate);
  inv.subtotal = t.subtotal;
  inv.tax = t.tax;
  inv.total = t.total;
  refreshInvoicePaymentStatus(inv);

  await inv.save();
  res.json({ success: true, data: inv });
});

// @desc    Mark invoice payment (admin)
// @route   PUT /api/invoices/:id/payment
const updatePayment = asyncHandler(async (req, res) => {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) throw new ApiError(404, 'Invoice not found');

  const { amountPaid, paymentMethod } = req.body;
  if (amountPaid !== undefined) {
    const nextAmount = Number(amountPaid);
    if (!Number.isFinite(nextAmount) || nextAmount < 0) {
      throw new ApiError(400, 'amountPaid must be a non-negative number');
    }
    if (nextAmount < (Number(inv.downPaymentApplied) || 0)) {
      throw new ApiError(400, 'amountPaid cannot be lower than the applied DP');
    }
    inv.amountPaid = nextAmount;
  }
  if (paymentMethod !== undefined) inv.paymentMethod = paymentMethod;
  refreshInvoicePaymentStatus(inv);

  await inv.save();
  res.json({ success: true, data: inv });
});

// @desc    Delete invoice (admin)
// @route   DELETE /api/invoices/:id
const deleteInvoice = asyncHandler(async (req, res) => {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) throw new ApiError(404, 'Invoice not found');
  await inv.deleteOne();
  res.json({ success: true, message: 'Invoice deleted' });
});

// @desc    Download invoice PDF
// @route   GET /api/invoices/:id/pdf
const downloadPdf = asyncHandler(async (req, res) => {
  const inv = await findInvoiceForView(req.params.id);
  if (!inv) throw new ApiError(404, 'Invoice not found');
  if (!canViewInvoice(req, inv)) throw new ApiError(403, 'Not authorized');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${inv.invoiceNumber}.pdf"`);

  const pdf = renderInvoicePdf(inv, {
    clinicName: process.env.CLINIC_NAME || 'DentalCare Clinic',
    clinicAddress: process.env.CLINIC_ADDRESS || '',
  });
  pdf.pipe(res);
});

module.exports = {
  createInvoice,
  listInvoices,
  getInvoice,
  updateInvoice,
  updatePayment,
  deleteInvoice,
  downloadPdf,
};
