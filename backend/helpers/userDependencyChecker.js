import Apartment from "../models/Apartment.js";
import Contract from "../models/Contract.js";

async function getUserDependencies(userId) {
    const [ownedApartments, rentedApartments, contractsAsTenant, contractsAsLandlord] = await Promise.all([
        Apartment.find({ isOwner: userId, deletedAt: null }).select("_id"),
        Apartment.find({ isRenter: userId, deletedAt: null }).select("_id"),
        Contract.find({ userId, deletedAt: null }).select("_id"),
        Contract.find({ landlordId: userId, deletedAt: null }).select("_id"),
    ]);

    return {
        owns: ownedApartments.length,
        rents: rentedApartments.length,
        contractsAsTenant: contractsAsTenant.length,
        contractsAsLandlord: contractsAsLandlord.length,
    };
}
export default getUserDependencies;
