import pandas as pd
import datetime
import json
import sys

df = pd.read_csv('C:/Users/joepa/OneDrive/Desktop/computerScienceYear4/GDP/Data/Fitabase Data 3.12.16-4.11.16/dailyActivity_merged.csv')

def get_daily_graph_VAM(start_date, end_date, userID):
    dates = pd.date_range(start_date,end_date,freq='d')
    return_list = []

    for date in dates:
        f_date = date.strftime('%#m/%#d/%Y')

        row = df.loc[(df['Id']== userID)&(df['ActivityDate']==f_date)]
        if not row.empty:
            return_list.append(row['VeryActiveMinutes'])
        else:
            return_list.append(0)
    print(json.dumps(return_list))
    return(json.dumps(return_list))

if __name__ == "__main__":

    function_name = sys.argv[1]

    if function_name == "function1":
        get_daily_graph_VAM(sys.argv[2], sys.argv[3], sys.argv[4])
    else:
        print(f"Unknown function: {function_name}")
        sys.exit(1)
#get_daily_graph_VAM('2016-03-25','2016-04-12', 1624580081)

