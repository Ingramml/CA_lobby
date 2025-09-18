--Payment to Lobbyist Association
Select
a."FILING_ID"
,a."FILER_NAML"
,a."FIRM_NAME"
,a."RPT_DATE"
,a."FROM_DATE"
,a."THRU_DATE"
,a."CUM_BEG_DT"
,o."RECIP_NAML"
,o."PMT_DATE"
,o."AMOUNT"
--,sum(cast(o."AMOUNT" as double PRECISION))
,o."CUM_AMT"
,o."AMEND_ID"
,o."LINE_ITEM"
,ROW_NUMBER() OVER (
            PARTITION BY o."FILING_ID", o."LINE_ITEM"
            ORDER BY o."FILING_ID" DESC, o."AMEND_ID" DESC, o."LINE_ITEM" DESC
        ) AS "row_num"


from cvr_lobby_disclosure_cd a 
left join latt_cd o on a."FILING_ID"=o."FILING_ID"
and a."AMEND_ID"=CAST(o."AMEND_ID" AS TEXT)
where EXISTS (SELECT
					county FROM "county_City" AS w
				WHERE
					a."FILER_NAML" ILIKE '%' || upper(w.county) || '%') 
	or	EXISTS(SELECT
					county FROM "county_City" AS w
				WHERE
					o."EMPLR_NAML" ILIKE '%' || upper(w.county) || '%') 			and "AMOUNT" is not null
--GROUP by 1,2,3,4,5,6,7,8,9,11,12
order by "FILING_ID","AMEND_ID","LINE_ITEM"
;