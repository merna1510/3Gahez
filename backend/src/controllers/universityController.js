import University from '../models/University.js';
import Place from '../models/Place.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getUniversities = asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim();
  const filter = search
    ? { $or: [
        { name: { $regex: escapeRegex(search), $options: 'i' } },
        { city: { $regex: escapeRegex(search), $options: 'i' } },
      ] }
    : {};

  const universities = await University.find(filter).sort({ name: 1 }).lean();
  const counts = await Place.aggregate([
    { $group: { _id: '$universityId', placesCount: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((item) => [String(item._id), item.placesCount]));
  const result = universities.map((university) => ({
    ...university,
    placesCount: countMap.get(String(university._id)) || 0,
  }));

  return sendSuccess(res, {
    message: 'Universities retrieved successfully',
    data: { universities: result },
  });
});

export const getUniversityById = asyncHandler(async (req, res) => {
  const university = await University.findById(req.params.id).lean();
  if (!university) throw ApiError.notFound('University not found');

  const places = await Place.find({ universityId: university._id })
    .select('name image type openingHours isOpen rating avgPrepTime')
    .sort({ name: 1 })
    .lean();

  return sendSuccess(res, {
    message: 'University retrieved successfully',
    data: { university: { ...university, placesCount: places.length, places } },
  });
});

export const createUniversity = asyncHandler(async (req, res) => {
  const { name, logo = '', city, description = '', location = '' } = req.body;
  const university = await University.create({ name, logo, city, description, location });
  return sendSuccess(res, {
    statusCode: 201,
    message: 'University created successfully',
    data: { university },
  });
});
