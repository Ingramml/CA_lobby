with base as (
-- Payment to lobbyist
Select
a."FILING_ID"
,a."FILER_NAML"
,a."FIRM_NAME"
,a."RPT_DATE"
,a."FROM_DATE"
,a."THRU_DATE"
,o."AMEND_ID"
,o."LINE_ITEM"
,o."EMPLR_NAML"
,o."FEES_AMT"
,o."REIMB_AMT"
,o."ADVAN_AMT"
,o."ADVAN_DSCR"
,o."PER_TOTAL"
,o."CUM_TOTAL"
,ROW_NUMBER() OVER (
            PARTITION BY o."FILING_ID", o."LINE_ITEM"
            ORDER BY o."FILING_ID" DESC, o."AMEND_ID" DESC, o."LINE_ITEM" DESC
        ) AS "row_num"


from cvr_lobby_disclosure_cd a 
left join lpay_cd o on a."FILING_ID"=o."FILING_ID"
where EXISTS (SELECT
					county FROM "county_City" AS w
				WHERE
					a."FILER_NAML" ILIKE '%' || upper(w.county) || '%') 
	or	EXISTS(SELECT
					county FROM "county_City" AS w
				WHERE
					o."EMPLR_NAML" ILIKE '%' || upper(w.county) || '%') 
					
	AND a."RPT_DATE" = (
        SELECT MAX(a2."RPT_DATE") 
        FROM cvr_lobby_disclosure_cd a2)  
    and a."AMEND_ID"=Cast(o."AMEND_ID" as TEXT)
    --and o."FILING_ID"='1009850'
    
    order by o."FILING_ID", o."LINE_ITEM",o."AMEND_ID" )
    
SELECT *
FROM base
WHERE row_num = (
    SELECT MAX(b2."row_num")  -- Ensure "row_num" is properly referenced
    FROM base b2 
    WHERE base."FILING_ID" = b2."FILING_ID" 
    AND base."LINE_ITEM" = b2."LINE_ITEM"  -- Explicitly referencing "LINE_ITEM"
)
ORDER BY "FILING_ID", "RPT_DATE" DESC;










