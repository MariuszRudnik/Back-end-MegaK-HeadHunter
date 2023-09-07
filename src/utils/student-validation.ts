import { UserEntity } from "src/auth/user.entity";
import { UserImport } from "src/types";

export const studentDataValidator = async (data: UserImport): Promise<boolean> => {
    const result = await UserEntity.find({
        where: {
            email: data.email
        }
    })

    if (result.length > 0) {
        return false
    }

    if (data.courseCompletion > 5 || data.courseCompletion < 1) {
        return false
    }

    if (data.courseEngagment > 5 || data.courseEngagment < 1) {
        return false
    }

    if (data.projectDegree > 5 || data.projectDegree < 1) {
        return false
    }

    if (data.teamProjectDegree > 5 || data.teamProjectDegree < 1) {
        return false
    }

    return true
}
