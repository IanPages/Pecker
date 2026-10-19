import type { Task} from "../../schedule/types/Task";

export interface RecentRecord extends Task {
    categories : { name: string; color: string} | null;
}