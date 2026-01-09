import { SORT_ORDER } from '../constants/constants.js';
import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find({
    userId,
  });

  if (filter.name) {
    contactsQuery
      .where('name')
      .regex(new RegExp(filter.name, 'i'));
  }
  if (filter.phoneNumber) {
    contactsQuery
      .where('phoneNumber')
      .regex(new RegExp(filter.phoneNumber));
  }
  if (filter.email) {
    contactsQuery
      .where('email')
      .regex(new RegExp(filter.email, 'i'));
  }
  if (typeof filter.isFavourite === 'boolean') {
    contactsQuery
      .where('isFavourite')
      .equals(filter.isFavourite);
  }
  if (filter.contactType) {
    contactsQuery
      .where('contactType')
      .equals(filter.contactType);
  }

  const [contactsCount, contacts] =
    await Promise.all([
      ContactsCollection.find({ userId })
        .merge(contactsQuery)
        .countDocuments(),
      contactsQuery
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
    });
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(
    payload,
  );
  return contact;
};

export const updateContact = async (
  contactId,
  payload,
  userId,
) => {
  const rawResult =
    await ContactsCollection.findOneAndUpdate(
      { _id: contactId, userId },
      payload,
      {
        new: true,
        includeResultMetadata: true,
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
      userId,
    });
  return contact;
};
