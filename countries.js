class Countries {

    constructor(limit, offset, isNoDataAvailable, search) {
        this.limit = limit;
        this.offset = offset;
        this.isNoDataAvailable = isNoDataAvailable;
        this.search = search;
        this.getCountriesList();
    }

    getCountriesList() {

        this.search = this.search.length >= 2 ? this.search : "";
        let self = this;

        $.ajax({
            url: "http://localhost:8085/getData",
            method: "POST",
            data: {
                limit: self.limit,
                offset: self.offset,
                search: self.search
            },
            cache: false,
            success: function (response) {                

                if (!response.data.length) {
                    $('#loading-msg').html("");
                    self.isNoDataAvailable = 1;
                } else {
                    $('#loading-msg').html(`<div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div>`);
                    self.isNoDataAvailable = 0;
                    self.generateData(response);

                    if(!$("#table-container").hasScrollBar()){
                        $('#loading-msg').html("");
                    }
                }
            }
        });
    }

    generateData(response) {
        let ele = "";

        response.data.forEach((value) => {
            ele = `<tr>                
                <td>${$.trim(value.id)}</td>
                <td>${$.trim(value.sortname)}</td>
                <td>${$.trim(value.name)}</td>                
                <td>${$.trim(value.phonecode)}</td>
                </tr>`;
            $("#rows-data").append(ele);
        });
    }

    onScrollEvent() {
        if (!this.isNoDataAvailable) {
            this.isNoDataAvailable = 1;
            this.offset = this.offset + this.limit;
            self = this;
            setTimeout(function () {
                self.getCountriesList();
            }, 1000);
        }
    }

    onSearch(value) {
        $("#rows-data").html("");
        this.limit = 20;
        this.offset = 0;
        this.isDataAvailable = 0;
        this.search = value;
        this.getCountriesList();
    }
}