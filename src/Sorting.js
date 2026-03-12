// import { dbg } from './utils.js';

export class Sorting {
    constructor(sortHeader, collection) {
        this.el = sortHeader;
        this.collection = collection;

        const $sorts = sortHeader.find("[data-sortfld]")
            .data("instance",this.collection)
            .on("click",this.sortNow.bind(this));

    }

    sortNow (ev) {
        let $lnk = $(ev.currentTarget);
        let fld = $lnk.data("sortfld");
        let dir = $lnk.data("sortdir");

        let inst = this.collection;
        let sort = inst.url.parameters.hasOwnProperty("sort")?inst.url.parameters.sort:"";
        let sortArr = [];
        sort.split(",").forEach(function(item){
            let res = /^(-*)([a-z0-9\-\_]+)$/.exec(item.trim());
            if(!res)
                return;
            if(res[2]==fld)
                return;
            sortArr.push(item);
        });

        switch (dir) {
            case "up":
                sortArr.push("-"+fld);
                $lnk.data("sortdir","down");
                $lnk.find(".sort-up").hide();
                $lnk.find(".sort-down").show();
                $lnk.find(".sort-default").hide();
                break;
            case "down":
                $lnk.data("sortdir",null);

                $lnk.find(".sort-up").hide();
                $lnk.find(".sort-down").hide();
                $lnk.find(".sort-default").show();
                break;
            default:
                $lnk.data("sortdir","up");
                sortArr.push(fld);

                $lnk.find(".sort-up").show();
                $lnk.find(".sort-down").hide();
                $lnk.find(".sort-default").hide();
        }

        let nxtSort = sortArr.join(",");
        if(sort!==nxtSort) {
            inst.url.parameters.sort = nxtSort;
            inst.loadFromRemote();
        }
    }
    destroy() {
        if (this.el) {
            $(this.el).find("[data-sortfld]").each(function(sort) {
                $(this).off("click");
                $(this).removeData("instance");
            });
        }
        return this;
    }
    
}