import * as fs from 'fs';

class DataSubject{

    constructor(id, date_start, date_end){
        this.id = id;
        this.date_start = date_start;
        this.date_end = date_end;
    }

    setDates(date_start, date_end){
        this.date_start = date_start
        this.date_end = date_end
    }

    getGraphData(){
        const csv = fs.readFileSync("./utility/da.csv", "utf8")
        console.log(csv)
    
    }

    getGraphData_day(){

    }

    getPeriodData(){
        //this will give total for the given period.
        //could go on to add averages and quartiles 
    }
    getPrevPeriodData(){
        //this will return the total for the previous period of the same amount of time.
    }

}

const test_user = new DataSubject(1624580081, '2016-03-25', '2016-04-12')
test_user.getGraphData()