import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model UserWorkProfile
 *
 */
export type UserWorkProfileModel = runtime.Types.Result.DefaultSelection<Prisma.$UserWorkProfilePayload>;
export type AggregateUserWorkProfile = {
    _count: UserWorkProfileCountAggregateOutputType | null;
    _min: UserWorkProfileMinAggregateOutputType | null;
    _max: UserWorkProfileMaxAggregateOutputType | null;
};
export type UserWorkProfileMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    workCategory: string | null;
    customInput: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type UserWorkProfileMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    workCategory: string | null;
    customInput: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type UserWorkProfileCountAggregateOutputType = {
    id: number;
    userId: number;
    workCategory: number;
    customInput: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type UserWorkProfileMinAggregateInputType = {
    id?: true;
    userId?: true;
    workCategory?: true;
    customInput?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type UserWorkProfileMaxAggregateInputType = {
    id?: true;
    userId?: true;
    workCategory?: true;
    customInput?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type UserWorkProfileCountAggregateInputType = {
    id?: true;
    userId?: true;
    workCategory?: true;
    customInput?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type UserWorkProfileAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which UserWorkProfile to aggregate.
     */
    where?: Prisma.UserWorkProfileWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserWorkProfiles to fetch.
     */
    orderBy?: Prisma.UserWorkProfileOrderByWithRelationInput | Prisma.UserWorkProfileOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.UserWorkProfileWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserWorkProfiles from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserWorkProfiles.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned UserWorkProfiles
    **/
    _count?: true | UserWorkProfileCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: UserWorkProfileMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: UserWorkProfileMaxAggregateInputType;
};
export type GetUserWorkProfileAggregateType<T extends UserWorkProfileAggregateArgs> = {
    [P in keyof T & keyof AggregateUserWorkProfile]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUserWorkProfile[P]> : Prisma.GetScalarType<T[P], AggregateUserWorkProfile[P]>;
};
export type UserWorkProfileGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWorkProfileWhereInput;
    orderBy?: Prisma.UserWorkProfileOrderByWithAggregationInput | Prisma.UserWorkProfileOrderByWithAggregationInput[];
    by: Prisma.UserWorkProfileScalarFieldEnum[] | Prisma.UserWorkProfileScalarFieldEnum;
    having?: Prisma.UserWorkProfileScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserWorkProfileCountAggregateInputType | true;
    _min?: UserWorkProfileMinAggregateInputType;
    _max?: UserWorkProfileMaxAggregateInputType;
};
export type UserWorkProfileGroupByOutputType = {
    id: string;
    userId: string;
    workCategory: string;
    customInput: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: UserWorkProfileCountAggregateOutputType | null;
    _min: UserWorkProfileMinAggregateOutputType | null;
    _max: UserWorkProfileMaxAggregateOutputType | null;
};
export type GetUserWorkProfileGroupByPayload<T extends UserWorkProfileGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UserWorkProfileGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UserWorkProfileGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UserWorkProfileGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UserWorkProfileGroupByOutputType[P]>;
}>>;
export type UserWorkProfileWhereInput = {
    AND?: Prisma.UserWorkProfileWhereInput | Prisma.UserWorkProfileWhereInput[];
    OR?: Prisma.UserWorkProfileWhereInput[];
    NOT?: Prisma.UserWorkProfileWhereInput | Prisma.UserWorkProfileWhereInput[];
    id?: Prisma.StringFilter<"UserWorkProfile"> | string;
    userId?: Prisma.StringFilter<"UserWorkProfile"> | string;
    workCategory?: Prisma.StringFilter<"UserWorkProfile"> | string;
    customInput?: Prisma.StringNullableFilter<"UserWorkProfile"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"UserWorkProfile"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"UserWorkProfile"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type UserWorkProfileOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    workCategory?: Prisma.SortOrder;
    customInput?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type UserWorkProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    userId?: string;
    AND?: Prisma.UserWorkProfileWhereInput | Prisma.UserWorkProfileWhereInput[];
    OR?: Prisma.UserWorkProfileWhereInput[];
    NOT?: Prisma.UserWorkProfileWhereInput | Prisma.UserWorkProfileWhereInput[];
    workCategory?: Prisma.StringFilter<"UserWorkProfile"> | string;
    customInput?: Prisma.StringNullableFilter<"UserWorkProfile"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"UserWorkProfile"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"UserWorkProfile"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id" | "userId">;
export type UserWorkProfileOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    workCategory?: Prisma.SortOrder;
    customInput?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.UserWorkProfileCountOrderByAggregateInput;
    _max?: Prisma.UserWorkProfileMaxOrderByAggregateInput;
    _min?: Prisma.UserWorkProfileMinOrderByAggregateInput;
};
export type UserWorkProfileScalarWhereWithAggregatesInput = {
    AND?: Prisma.UserWorkProfileScalarWhereWithAggregatesInput | Prisma.UserWorkProfileScalarWhereWithAggregatesInput[];
    OR?: Prisma.UserWorkProfileScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UserWorkProfileScalarWhereWithAggregatesInput | Prisma.UserWorkProfileScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"UserWorkProfile"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"UserWorkProfile"> | string;
    workCategory?: Prisma.StringWithAggregatesFilter<"UserWorkProfile"> | string;
    customInput?: Prisma.StringNullableWithAggregatesFilter<"UserWorkProfile"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"UserWorkProfile"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"UserWorkProfile"> | Date | string;
};
export type UserWorkProfileCreateInput = {
    id?: string;
    workCategory: string;
    customInput?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutWorkProfileInput;
};
export type UserWorkProfileUncheckedCreateInput = {
    id?: string;
    userId: string;
    workCategory: string;
    customInput?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type UserWorkProfileUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    workCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    customInput?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutWorkProfileNestedInput;
};
export type UserWorkProfileUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    workCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    customInput?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserWorkProfileCreateManyInput = {
    id?: string;
    userId: string;
    workCategory: string;
    customInput?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type UserWorkProfileUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    workCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    customInput?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserWorkProfileUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    workCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    customInput?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserWorkProfileNullableScalarRelationFilter = {
    is?: Prisma.UserWorkProfileWhereInput | null;
    isNot?: Prisma.UserWorkProfileWhereInput | null;
};
export type UserWorkProfileCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    workCategory?: Prisma.SortOrder;
    customInput?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type UserWorkProfileMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    workCategory?: Prisma.SortOrder;
    customInput?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type UserWorkProfileMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    workCategory?: Prisma.SortOrder;
    customInput?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type UserWorkProfileCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.UserWorkProfileCreateWithoutUserInput, Prisma.UserWorkProfileUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.UserWorkProfileCreateOrConnectWithoutUserInput;
    connect?: Prisma.UserWorkProfileWhereUniqueInput;
};
export type UserWorkProfileUncheckedCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.UserWorkProfileCreateWithoutUserInput, Prisma.UserWorkProfileUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.UserWorkProfileCreateOrConnectWithoutUserInput;
    connect?: Prisma.UserWorkProfileWhereUniqueInput;
};
export type UserWorkProfileUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.UserWorkProfileCreateWithoutUserInput, Prisma.UserWorkProfileUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.UserWorkProfileCreateOrConnectWithoutUserInput;
    upsert?: Prisma.UserWorkProfileUpsertWithoutUserInput;
    disconnect?: Prisma.UserWorkProfileWhereInput | boolean;
    delete?: Prisma.UserWorkProfileWhereInput | boolean;
    connect?: Prisma.UserWorkProfileWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserWorkProfileUpdateToOneWithWhereWithoutUserInput, Prisma.UserWorkProfileUpdateWithoutUserInput>, Prisma.UserWorkProfileUncheckedUpdateWithoutUserInput>;
};
export type UserWorkProfileUncheckedUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.UserWorkProfileCreateWithoutUserInput, Prisma.UserWorkProfileUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.UserWorkProfileCreateOrConnectWithoutUserInput;
    upsert?: Prisma.UserWorkProfileUpsertWithoutUserInput;
    disconnect?: Prisma.UserWorkProfileWhereInput | boolean;
    delete?: Prisma.UserWorkProfileWhereInput | boolean;
    connect?: Prisma.UserWorkProfileWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserWorkProfileUpdateToOneWithWhereWithoutUserInput, Prisma.UserWorkProfileUpdateWithoutUserInput>, Prisma.UserWorkProfileUncheckedUpdateWithoutUserInput>;
};
export type UserWorkProfileCreateWithoutUserInput = {
    id?: string;
    workCategory: string;
    customInput?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type UserWorkProfileUncheckedCreateWithoutUserInput = {
    id?: string;
    workCategory: string;
    customInput?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type UserWorkProfileCreateOrConnectWithoutUserInput = {
    where: Prisma.UserWorkProfileWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserWorkProfileCreateWithoutUserInput, Prisma.UserWorkProfileUncheckedCreateWithoutUserInput>;
};
export type UserWorkProfileUpsertWithoutUserInput = {
    update: Prisma.XOR<Prisma.UserWorkProfileUpdateWithoutUserInput, Prisma.UserWorkProfileUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.UserWorkProfileCreateWithoutUserInput, Prisma.UserWorkProfileUncheckedCreateWithoutUserInput>;
    where?: Prisma.UserWorkProfileWhereInput;
};
export type UserWorkProfileUpdateToOneWithWhereWithoutUserInput = {
    where?: Prisma.UserWorkProfileWhereInput;
    data: Prisma.XOR<Prisma.UserWorkProfileUpdateWithoutUserInput, Prisma.UserWorkProfileUncheckedUpdateWithoutUserInput>;
};
export type UserWorkProfileUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    workCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    customInput?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserWorkProfileUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    workCategory?: Prisma.StringFieldUpdateOperationsInput | string;
    customInput?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type UserWorkProfileSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    workCategory?: boolean;
    customInput?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userWorkProfile"]>;
export type UserWorkProfileSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    workCategory?: boolean;
    customInput?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userWorkProfile"]>;
export type UserWorkProfileSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    workCategory?: boolean;
    customInput?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["userWorkProfile"]>;
export type UserWorkProfileSelectScalar = {
    id?: boolean;
    userId?: boolean;
    workCategory?: boolean;
    customInput?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type UserWorkProfileOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "workCategory" | "customInput" | "createdAt" | "updatedAt", ExtArgs["result"]["userWorkProfile"]>;
export type UserWorkProfileInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type UserWorkProfileIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type UserWorkProfileIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $UserWorkProfilePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "UserWorkProfile";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        workCategory: string;
        customInput: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["userWorkProfile"]>;
    composites: {};
};
export type UserWorkProfileGetPayload<S extends boolean | null | undefined | UserWorkProfileDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UserWorkProfilePayload, S>;
export type UserWorkProfileCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UserWorkProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserWorkProfileCountAggregateInputType | true;
};
export interface UserWorkProfileDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['UserWorkProfile'];
        meta: {
            name: 'UserWorkProfile';
        };
    };
    /**
     * Find zero or one UserWorkProfile that matches the filter.
     * @param {UserWorkProfileFindUniqueArgs} args - Arguments to find a UserWorkProfile
     * @example
     * // Get one UserWorkProfile
     * const userWorkProfile = await prisma.userWorkProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserWorkProfileFindUniqueArgs>(args: Prisma.SelectSubset<T, UserWorkProfileFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UserWorkProfileClient<runtime.Types.Result.GetResult<Prisma.$UserWorkProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one UserWorkProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserWorkProfileFindUniqueOrThrowArgs} args - Arguments to find a UserWorkProfile
     * @example
     * // Get one UserWorkProfile
     * const userWorkProfile = await prisma.userWorkProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserWorkProfileFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UserWorkProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserWorkProfileClient<runtime.Types.Result.GetResult<Prisma.$UserWorkProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first UserWorkProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWorkProfileFindFirstArgs} args - Arguments to find a UserWorkProfile
     * @example
     * // Get one UserWorkProfile
     * const userWorkProfile = await prisma.userWorkProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserWorkProfileFindFirstArgs>(args?: Prisma.SelectSubset<T, UserWorkProfileFindFirstArgs<ExtArgs>>): Prisma.Prisma__UserWorkProfileClient<runtime.Types.Result.GetResult<Prisma.$UserWorkProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first UserWorkProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWorkProfileFindFirstOrThrowArgs} args - Arguments to find a UserWorkProfile
     * @example
     * // Get one UserWorkProfile
     * const userWorkProfile = await prisma.userWorkProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserWorkProfileFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UserWorkProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserWorkProfileClient<runtime.Types.Result.GetResult<Prisma.$UserWorkProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more UserWorkProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWorkProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserWorkProfiles
     * const userWorkProfiles = await prisma.userWorkProfile.findMany()
     *
     * // Get first 10 UserWorkProfiles
     * const userWorkProfiles = await prisma.userWorkProfile.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const userWorkProfileWithIdOnly = await prisma.userWorkProfile.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UserWorkProfileFindManyArgs>(args?: Prisma.SelectSubset<T, UserWorkProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserWorkProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a UserWorkProfile.
     * @param {UserWorkProfileCreateArgs} args - Arguments to create a UserWorkProfile.
     * @example
     * // Create one UserWorkProfile
     * const UserWorkProfile = await prisma.userWorkProfile.create({
     *   data: {
     *     // ... data to create a UserWorkProfile
     *   }
     * })
     *
     */
    create<T extends UserWorkProfileCreateArgs>(args: Prisma.SelectSubset<T, UserWorkProfileCreateArgs<ExtArgs>>): Prisma.Prisma__UserWorkProfileClient<runtime.Types.Result.GetResult<Prisma.$UserWorkProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many UserWorkProfiles.
     * @param {UserWorkProfileCreateManyArgs} args - Arguments to create many UserWorkProfiles.
     * @example
     * // Create many UserWorkProfiles
     * const userWorkProfile = await prisma.userWorkProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UserWorkProfileCreateManyArgs>(args?: Prisma.SelectSubset<T, UserWorkProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many UserWorkProfiles and returns the data saved in the database.
     * @param {UserWorkProfileCreateManyAndReturnArgs} args - Arguments to create many UserWorkProfiles.
     * @example
     * // Create many UserWorkProfiles
     * const userWorkProfile = await prisma.userWorkProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many UserWorkProfiles and only return the `id`
     * const userWorkProfileWithIdOnly = await prisma.userWorkProfile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UserWorkProfileCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UserWorkProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserWorkProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a UserWorkProfile.
     * @param {UserWorkProfileDeleteArgs} args - Arguments to delete one UserWorkProfile.
     * @example
     * // Delete one UserWorkProfile
     * const UserWorkProfile = await prisma.userWorkProfile.delete({
     *   where: {
     *     // ... filter to delete one UserWorkProfile
     *   }
     * })
     *
     */
    delete<T extends UserWorkProfileDeleteArgs>(args: Prisma.SelectSubset<T, UserWorkProfileDeleteArgs<ExtArgs>>): Prisma.Prisma__UserWorkProfileClient<runtime.Types.Result.GetResult<Prisma.$UserWorkProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one UserWorkProfile.
     * @param {UserWorkProfileUpdateArgs} args - Arguments to update one UserWorkProfile.
     * @example
     * // Update one UserWorkProfile
     * const userWorkProfile = await prisma.userWorkProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UserWorkProfileUpdateArgs>(args: Prisma.SelectSubset<T, UserWorkProfileUpdateArgs<ExtArgs>>): Prisma.Prisma__UserWorkProfileClient<runtime.Types.Result.GetResult<Prisma.$UserWorkProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more UserWorkProfiles.
     * @param {UserWorkProfileDeleteManyArgs} args - Arguments to filter UserWorkProfiles to delete.
     * @example
     * // Delete a few UserWorkProfiles
     * const { count } = await prisma.userWorkProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UserWorkProfileDeleteManyArgs>(args?: Prisma.SelectSubset<T, UserWorkProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more UserWorkProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWorkProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserWorkProfiles
     * const userWorkProfile = await prisma.userWorkProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UserWorkProfileUpdateManyArgs>(args: Prisma.SelectSubset<T, UserWorkProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more UserWorkProfiles and returns the data updated in the database.
     * @param {UserWorkProfileUpdateManyAndReturnArgs} args - Arguments to update many UserWorkProfiles.
     * @example
     * // Update many UserWorkProfiles
     * const userWorkProfile = await prisma.userWorkProfile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more UserWorkProfiles and only return the `id`
     * const userWorkProfileWithIdOnly = await prisma.userWorkProfile.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends UserWorkProfileUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UserWorkProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserWorkProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one UserWorkProfile.
     * @param {UserWorkProfileUpsertArgs} args - Arguments to update or create a UserWorkProfile.
     * @example
     * // Update or create a UserWorkProfile
     * const userWorkProfile = await prisma.userWorkProfile.upsert({
     *   create: {
     *     // ... data to create a UserWorkProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserWorkProfile we want to update
     *   }
     * })
     */
    upsert<T extends UserWorkProfileUpsertArgs>(args: Prisma.SelectSubset<T, UserWorkProfileUpsertArgs<ExtArgs>>): Prisma.Prisma__UserWorkProfileClient<runtime.Types.Result.GetResult<Prisma.$UserWorkProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of UserWorkProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWorkProfileCountArgs} args - Arguments to filter UserWorkProfiles to count.
     * @example
     * // Count the number of UserWorkProfiles
     * const count = await prisma.userWorkProfile.count({
     *   where: {
     *     // ... the filter for the UserWorkProfiles we want to count
     *   }
     * })
    **/
    count<T extends UserWorkProfileCountArgs>(args?: Prisma.Subset<T, UserWorkProfileCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UserWorkProfileCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a UserWorkProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWorkProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserWorkProfileAggregateArgs>(args: Prisma.Subset<T, UserWorkProfileAggregateArgs>): Prisma.PrismaPromise<GetUserWorkProfileAggregateType<T>>;
    /**
     * Group by UserWorkProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWorkProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends UserWorkProfileGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UserWorkProfileGroupByArgs['orderBy'];
    } : {
        orderBy?: UserWorkProfileGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UserWorkProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserWorkProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the UserWorkProfile model
     */
    readonly fields: UserWorkProfileFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for UserWorkProfile.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__UserWorkProfileClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the UserWorkProfile model
 */
export interface UserWorkProfileFieldRefs {
    readonly id: Prisma.FieldRef<"UserWorkProfile", 'String'>;
    readonly userId: Prisma.FieldRef<"UserWorkProfile", 'String'>;
    readonly workCategory: Prisma.FieldRef<"UserWorkProfile", 'String'>;
    readonly customInput: Prisma.FieldRef<"UserWorkProfile", 'String'>;
    readonly createdAt: Prisma.FieldRef<"UserWorkProfile", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"UserWorkProfile", 'DateTime'>;
}
/**
 * UserWorkProfile findUnique
 */
export type UserWorkProfileFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWorkProfile
     */
    select?: Prisma.UserWorkProfileSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserWorkProfile
     */
    omit?: Prisma.UserWorkProfileOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserWorkProfileInclude<ExtArgs> | null;
    /**
     * Filter, which UserWorkProfile to fetch.
     */
    where: Prisma.UserWorkProfileWhereUniqueInput;
};
/**
 * UserWorkProfile findUniqueOrThrow
 */
export type UserWorkProfileFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWorkProfile
     */
    select?: Prisma.UserWorkProfileSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserWorkProfile
     */
    omit?: Prisma.UserWorkProfileOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserWorkProfileInclude<ExtArgs> | null;
    /**
     * Filter, which UserWorkProfile to fetch.
     */
    where: Prisma.UserWorkProfileWhereUniqueInput;
};
/**
 * UserWorkProfile findFirst
 */
export type UserWorkProfileFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWorkProfile
     */
    select?: Prisma.UserWorkProfileSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserWorkProfile
     */
    omit?: Prisma.UserWorkProfileOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserWorkProfileInclude<ExtArgs> | null;
    /**
     * Filter, which UserWorkProfile to fetch.
     */
    where?: Prisma.UserWorkProfileWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserWorkProfiles to fetch.
     */
    orderBy?: Prisma.UserWorkProfileOrderByWithRelationInput | Prisma.UserWorkProfileOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UserWorkProfiles.
     */
    cursor?: Prisma.UserWorkProfileWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserWorkProfiles from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserWorkProfiles.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserWorkProfiles.
     */
    distinct?: Prisma.UserWorkProfileScalarFieldEnum | Prisma.UserWorkProfileScalarFieldEnum[];
};
/**
 * UserWorkProfile findFirstOrThrow
 */
export type UserWorkProfileFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWorkProfile
     */
    select?: Prisma.UserWorkProfileSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserWorkProfile
     */
    omit?: Prisma.UserWorkProfileOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserWorkProfileInclude<ExtArgs> | null;
    /**
     * Filter, which UserWorkProfile to fetch.
     */
    where?: Prisma.UserWorkProfileWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserWorkProfiles to fetch.
     */
    orderBy?: Prisma.UserWorkProfileOrderByWithRelationInput | Prisma.UserWorkProfileOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UserWorkProfiles.
     */
    cursor?: Prisma.UserWorkProfileWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserWorkProfiles from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserWorkProfiles.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserWorkProfiles.
     */
    distinct?: Prisma.UserWorkProfileScalarFieldEnum | Prisma.UserWorkProfileScalarFieldEnum[];
};
/**
 * UserWorkProfile findMany
 */
export type UserWorkProfileFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWorkProfile
     */
    select?: Prisma.UserWorkProfileSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserWorkProfile
     */
    omit?: Prisma.UserWorkProfileOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserWorkProfileInclude<ExtArgs> | null;
    /**
     * Filter, which UserWorkProfiles to fetch.
     */
    where?: Prisma.UserWorkProfileWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UserWorkProfiles to fetch.
     */
    orderBy?: Prisma.UserWorkProfileOrderByWithRelationInput | Prisma.UserWorkProfileOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing UserWorkProfiles.
     */
    cursor?: Prisma.UserWorkProfileWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UserWorkProfiles from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UserWorkProfiles.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UserWorkProfiles.
     */
    distinct?: Prisma.UserWorkProfileScalarFieldEnum | Prisma.UserWorkProfileScalarFieldEnum[];
};
/**
 * UserWorkProfile create
 */
export type UserWorkProfileCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWorkProfile
     */
    select?: Prisma.UserWorkProfileSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserWorkProfile
     */
    omit?: Prisma.UserWorkProfileOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserWorkProfileInclude<ExtArgs> | null;
    /**
     * The data needed to create a UserWorkProfile.
     */
    data: Prisma.XOR<Prisma.UserWorkProfileCreateInput, Prisma.UserWorkProfileUncheckedCreateInput>;
};
/**
 * UserWorkProfile createMany
 */
export type UserWorkProfileCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserWorkProfiles.
     */
    data: Prisma.UserWorkProfileCreateManyInput | Prisma.UserWorkProfileCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * UserWorkProfile createManyAndReturn
 */
export type UserWorkProfileCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWorkProfile
     */
    select?: Prisma.UserWorkProfileSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the UserWorkProfile
     */
    omit?: Prisma.UserWorkProfileOmit<ExtArgs> | null;
    /**
     * The data used to create many UserWorkProfiles.
     */
    data: Prisma.UserWorkProfileCreateManyInput | Prisma.UserWorkProfileCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserWorkProfileIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * UserWorkProfile update
 */
export type UserWorkProfileUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWorkProfile
     */
    select?: Prisma.UserWorkProfileSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserWorkProfile
     */
    omit?: Prisma.UserWorkProfileOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserWorkProfileInclude<ExtArgs> | null;
    /**
     * The data needed to update a UserWorkProfile.
     */
    data: Prisma.XOR<Prisma.UserWorkProfileUpdateInput, Prisma.UserWorkProfileUncheckedUpdateInput>;
    /**
     * Choose, which UserWorkProfile to update.
     */
    where: Prisma.UserWorkProfileWhereUniqueInput;
};
/**
 * UserWorkProfile updateMany
 */
export type UserWorkProfileUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update UserWorkProfiles.
     */
    data: Prisma.XOR<Prisma.UserWorkProfileUpdateManyMutationInput, Prisma.UserWorkProfileUncheckedUpdateManyInput>;
    /**
     * Filter which UserWorkProfiles to update
     */
    where?: Prisma.UserWorkProfileWhereInput;
    /**
     * Limit how many UserWorkProfiles to update.
     */
    limit?: number;
};
/**
 * UserWorkProfile updateManyAndReturn
 */
export type UserWorkProfileUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWorkProfile
     */
    select?: Prisma.UserWorkProfileSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the UserWorkProfile
     */
    omit?: Prisma.UserWorkProfileOmit<ExtArgs> | null;
    /**
     * The data used to update UserWorkProfiles.
     */
    data: Prisma.XOR<Prisma.UserWorkProfileUpdateManyMutationInput, Prisma.UserWorkProfileUncheckedUpdateManyInput>;
    /**
     * Filter which UserWorkProfiles to update
     */
    where?: Prisma.UserWorkProfileWhereInput;
    /**
     * Limit how many UserWorkProfiles to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserWorkProfileIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * UserWorkProfile upsert
 */
export type UserWorkProfileUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWorkProfile
     */
    select?: Prisma.UserWorkProfileSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserWorkProfile
     */
    omit?: Prisma.UserWorkProfileOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserWorkProfileInclude<ExtArgs> | null;
    /**
     * The filter to search for the UserWorkProfile to update in case it exists.
     */
    where: Prisma.UserWorkProfileWhereUniqueInput;
    /**
     * In case the UserWorkProfile found by the `where` argument doesn't exist, create a new UserWorkProfile with this data.
     */
    create: Prisma.XOR<Prisma.UserWorkProfileCreateInput, Prisma.UserWorkProfileUncheckedCreateInput>;
    /**
     * In case the UserWorkProfile was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.UserWorkProfileUpdateInput, Prisma.UserWorkProfileUncheckedUpdateInput>;
};
/**
 * UserWorkProfile delete
 */
export type UserWorkProfileDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWorkProfile
     */
    select?: Prisma.UserWorkProfileSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserWorkProfile
     */
    omit?: Prisma.UserWorkProfileOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserWorkProfileInclude<ExtArgs> | null;
    /**
     * Filter which UserWorkProfile to delete.
     */
    where: Prisma.UserWorkProfileWhereUniqueInput;
};
/**
 * UserWorkProfile deleteMany
 */
export type UserWorkProfileDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which UserWorkProfiles to delete
     */
    where?: Prisma.UserWorkProfileWhereInput;
    /**
     * Limit how many UserWorkProfiles to delete.
     */
    limit?: number;
};
/**
 * UserWorkProfile without action
 */
export type UserWorkProfileDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWorkProfile
     */
    select?: Prisma.UserWorkProfileSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UserWorkProfile
     */
    omit?: Prisma.UserWorkProfileOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.UserWorkProfileInclude<ExtArgs> | null;
};
