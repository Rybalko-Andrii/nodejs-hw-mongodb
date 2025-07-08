import { SORT_ORDER } from '../constants/constants.js';
import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  userId,
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const query = { userId }; // 🔐 Фільтр по юзеру

  if (filter.name) {
    query.name = {
      $regex: filter.name,
      $options: 'i',
    };
  }
  if (filter.phoneNumber) {
    query.phoneNumber = {
      $regex: filter.phoneNumber,
    };
  }
  if (filter.email) {
    query.email = {
      $regex: filter.email,
      $options: 'i',
    };
  }
  if (typeof filter.isFavourite === 'boolean') {
    query.isFavourite = filter.isFavourite;
  }
  if (filter.contactType) {
    query.contactType = filter.contactType;
  }

  const [contactsCount, contacts] =
    await Promise.all([
      ContactsCollection.countDocuments(query),
      ContactsCollection.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy]: sortOrder })
        .exec(),
    ]);

  const paginationData = calculatePaginationData(
    contactsCount,
    perPage,
    page,
  );

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = async (
  contactId,
  userId,
) => {
  const contact =
    await ContactsCollection.findOne({
      _id: contactId,
      userId,
    }); // 🔐
  return contact;
};

export const createContact = async (
  payload,
  userId,
) => {
  const contact = await ContactsCollection.create(
    {
      ...payload,
      userId, // 🔐
    },
  );
  return contact;
};

export const updateContact = async (
  contactId,
  payload,
  userId,
  options = {},
) => {
  const rawResult =
    await ContactsCollection.findOneAndUpdate(
      { _id: contactId, userId }, // 🔐
      payload,
      {
        new: true,
        includeResultMetadata: true,
        ...options,
      },
    );

  if (!rawResult || !rawResult.value) return null;

  return {
    contact: rawResult.value,
    isNew: Boolean(
      rawResult?.lastErrorObject?.upserted,
    ),
  };
};

export const deleteContact = async (
  contactId,
  userId,
) => {
  const contact =
    await ContactsCollection.findOneAndDelete({
      _id: contactId,
      userId, // 🔐
    });
  return contact;
};
