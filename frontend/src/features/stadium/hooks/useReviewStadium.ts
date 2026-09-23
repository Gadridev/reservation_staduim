import { useQuery } from "@tanstack/react-query";
import { getReviewsStadium } from "../api";

export function useReviewsStadium(id:string){
    return useQuery({
        queryKey:["review",id],
        queryFn:()=>getReviewsStadium(id)
    })
}