import type { CreateListingRequest, CreateTicketUploadRequest } from "./types"
import {
  completeTicketUpload,
  createListing,
  createTicketUpload,
  getManualReviewEvidence,
  getManualReviewListings,
  getListingById,
  getListings,
  getMyListings,
  publishListing,
  reviewManualListing,
  submitManualTicketReview,
  getMyListingById,
  getDraftTicketUploadStatus,
} from "./client"
import { rtkApi, runQuery } from "../rtk-api"

const listingsApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    getManualReviewListings:
      builder.query<Awaited<ReturnType<typeof getManualReviewListings>>, void>({
        queryFn: () => runQuery(() => getManualReviewListings()),
        providesTags: ["Tickets"],
      }),
    getManualReviewEvidence:
      builder.query<Awaited<ReturnType<typeof getManualReviewEvidence>>, string>(
        {
          queryFn: (listingId) =>
            runQuery(() => getManualReviewEvidence(listingId)),
        },
      ),
    reviewManualListing:
      builder.mutation<Awaited<ReturnType<typeof reviewManualListing>>, {
        listingId: string
        decision: "approve" | "reject"
        note?: string
      }>({
        queryFn: ({ listingId, decision, note }) =>
          runQuery(() => reviewManualListing(listingId, decision, note)),
        invalidatesTags: ["Tickets", "Listings"],
      }),
    getListings: builder.query<Awaited<ReturnType<typeof getListings>>, {
      limit?: number
      cursor?: string
    }>({
      queryFn: (options) => runQuery(() => getListings(options)),
      providesTags: ["Listings"],
    }),
    getMyListings:
      builder.query<Awaited<ReturnType<typeof getMyListings>>, void>({
        queryFn: () => runQuery(() => getMyListings()),
        providesTags: ["Listings"],
      }),
    getListingById:
      builder.query<Awaited<ReturnType<typeof getListingById>>, string>({
        queryFn: (listingId) => runQuery(() => getListingById(listingId)),
        providesTags: (_result, _error, listingId) => [
          { type: "Listings", id: listingId },
        ],
      }),
    getMyListingById:
      builder.query<Awaited<ReturnType<typeof getMyListingById>>, string>({
        queryFn: (listingId) => runQuery(() => getMyListingById(listingId)),
        providesTags: (_result, _error, listingId) => [
          { type: "Listings", id: listingId },
        ],
      }),
    getDraftTicketUploadStatus: builder.query<
      Awaited<ReturnType<typeof getDraftTicketUploadStatus>>,
      string
    >({
      queryFn: (listingId) =>
        runQuery(() => getDraftTicketUploadStatus(listingId)),
      providesTags: (_result, _error, listingId) => [
        { type: "Listings", id: listingId },
      ],
    }),
    createListing: builder.mutation<Awaited<ReturnType<typeof createListing>>, {
      payload: CreateListingRequest
      idempotencyKey?: string
    }>({
      queryFn: ({ payload, idempotencyKey }) =>
        runQuery(() => createListing(payload, idempotencyKey)),
      invalidatesTags: ["Listings", "AccountSummary"],
    }),
    createTicketUpload:
      builder.mutation<Awaited<ReturnType<typeof createTicketUpload>>, {
        listingId: string
        payload: CreateTicketUploadRequest
      }>({
        queryFn: ({ listingId, payload }) =>
          runQuery(() => createTicketUpload(listingId, payload)),
      }),
    completeTicketUpload:
      builder.mutation<Awaited<ReturnType<typeof completeTicketUpload>>, {
        listingId: string
        uploadId: string
      }>({
        queryFn: ({ listingId, uploadId }) =>
          runQuery(() => completeTicketUpload(listingId, uploadId)),
      }),
    submitManualTicketReview:
      builder.mutation<Awaited<ReturnType<typeof submitManualTicketReview>>, string>(
        {
          queryFn: (listingId) =>
            runQuery(() => submitManualTicketReview(listingId)),
          invalidatesTags: ["Listings", "AccountSummary"],
        },
      ),
    publishListing:
      builder.mutation<Awaited<ReturnType<typeof publishListing>>, {
        listingId: string
        idempotencyKey?: string
      }>({
        queryFn: ({ listingId, idempotencyKey }) =>
          runQuery(() => publishListing(listingId, idempotencyKey)),
        invalidatesTags: ["Listings", "AccountSummary"],
      }),
  }),
})

export const {
  useGetManualReviewListingsQuery,
  useGetManualReviewEvidenceQuery,
  useLazyGetManualReviewEvidenceQuery,
  useReviewManualListingMutation,
  useGetListingsQuery,
  useLazyGetListingsQuery,
  useGetMyListingsQuery,
  useGetListingByIdQuery,
  useLazyGetListingByIdQuery,
  useCreateListingMutation,
  useCreateTicketUploadMutation,
  useCompleteTicketUploadMutation,
  useSubmitManualTicketReviewMutation,
  usePublishListingMutation,
  useLazyGetMyListingByIdQuery,
  useLazyGetDraftTicketUploadStatusQuery,
} = listingsApi
