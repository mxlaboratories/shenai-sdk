package ai.mxlabs.sdk_android_example.utils

class Country(
  val nameCode: String,
  val fullName: String
)

fun getFlagEmojiFor(countryCode: String): String {
  return when (countryCode.lowercase()) {
    "ad" -> "🇦🇩"
    "ae" -> "🇦🇪"
    "af" -> "🇦🇫"
    "ag" -> "🇦🇬"
    "ai" -> "🇦🇮"
    "al" -> "🇦🇱"
    "am" -> "🇦🇲"
    "ao" -> "🇦🇴"
    "aq" -> "🇦🇶"
    "ar" -> "🇦🇷"
    "as" -> "🇦🇸"
    "at" -> "🇦🇹"
    "au" -> "🇦🇺"
    "aw" -> "🇦🇼"
    "ax" -> "🇦🇽"
    "az" -> "🇦🇿"
    "ba" -> "🇧🇦"
    "bb" -> "🇧🇧"
    "bd" -> "🇧🇩"
    "be" -> "🇧🇪"
    "bf" -> "🇧🇫"
    "bg" -> "🇧🇬"
    "bh" -> "🇧🇭"
    "bi" -> "🇧🇮"
    "bj" -> "🇧🇯"
    "bl" -> "🇧🇱"
    "bm" -> "🇧🇲"
    "bn" -> "🇧🇳"
    "bo" -> "🇧🇴"
    "bq" -> "🇧🇶"
    "br" -> "🇧🇷"
    "bs" -> "🇧🇸"
    "bt" -> "🇧🇹"
    "bv" -> "🇧🇻"
    "bw" -> "🇧🇼"
    "by" -> "🇧🇾"
    "bz" -> "🇧🇿"
    "ca" -> "🇨🇦"
    "cc" -> "🇨🇨"
    "cd" -> "🇨🇩"
    "cf" -> "🇨🇫"
    "cg" -> "🇨🇬"
    "ch" -> "🇨🇭"
    "ci" -> "🇨🇮"
    "ck" -> "🇨🇰"
    "cl" -> "🇨🇱"
    "cm" -> "🇨🇲"
    "cn" -> "🇨🇳"
    "co" -> "🇨🇴"
    "cr" -> "🇨🇷"
    "cu" -> "🇨🇺"
    "cv" -> "🇨🇻"
    "cw" -> "🇨🇼"
    "cx" -> "🇨🇽"
    "cy" -> "🇨🇾"
    "cz" -> "🇨🇿"
    "de" -> "🇩🇪"
    "dj" -> "🇩🇯"
    "dk" -> "🇩🇰"
    "dm" -> "🇩🇲"
    "do" -> "🇩🇴"
    "dz" -> "🇩🇿"
    "ec" -> "🇪🇨"
    "ee" -> "🇪🇪"
    "eg" -> "🇪🇬"
    "eh" -> "🇪🇭"
    "er" -> "🇪🇷"
    "es" -> "🇪🇸"
    "et" -> "🇪🇹"
    "fi" -> "🇫🇮"
    "fj" -> "🇫🇯"
    "fk" -> "🇫🇰"
    "fm" -> "🇫🇲"
    "fo" -> "🇫🇴"
    "fr" -> "🇫🇷"
    "ga" -> "🇬🇦"
    "gb" -> "🇬🇧"
    "gd" -> "🇬🇩"
    "ge" -> "🇬🇪"
    "gf" -> "🇬🇫"
    "gg" -> "🇬🇬"
    "gh" -> "🇬🇭"
    "gi" -> "🇬🇮"
    "gl" -> "🇬🇱"
    "gm" -> "🇬🇲"
    "gn" -> "🇬🇳"
    "gp" -> "🇬🇵"
    "gq" -> "🇬🇶"
    "gr" -> "🇬🇷"
    "gs" -> "🇬🇸"
    "gt" -> "🇬🇹"
    "gu" -> "🇬🇺"
    "gw" -> "🇬🇼"
    "gy" -> "🇬🇾"
    "hk" -> "🇭🇰"
    "hm" -> "🇭🇲"
    "hn" -> "🇭🇳"
    "hr" -> "🇭🇷"
    "ht" -> "🇭🇹"
    "hu" -> "🇭🇺"
    "id" -> "🇮🇩"
    "ie" -> "🇮🇪"
    "il" -> "🇮🇱"
    "im" -> "🇮🇲"
    "in" -> "🇮🇳"
    "io" -> "🇮🇴"
    "iq" -> "🇮🇶"
    "ir" -> "🇮🇷"
    "is" -> "🇮🇸"
    "it" -> "🇮🇹"
    "je" -> "🇯🇪"
    "jm" -> "🇯🇲"
    "jo" -> "🇯🇴"
    "jp" -> "🇯🇵"
    "ke" -> "🇰🇪"
    "kg" -> "🇰🇬"
    "kh" -> "🇰🇭"
    "ki" -> "🇰🇮"
    "km" -> "🇰🇲"
    "kn" -> "🇰🇳"
    "kp" -> "🇰🇵"
    "kr" -> "🇰🇷"
    "kw" -> "🇰🇼"
    "ky" -> "🇰🇾"
    "kz" -> "🇰🇿"
    "la" -> "🇱🇦"
    "lb" -> "🇱🇧"
    "lc" -> "🇱🇨"
    "li" -> "🇱🇮"
    "lk" -> "🇱🇰"
    "lr" -> "🇱🇷"
    "ls" -> "🇱🇸"
    "lt" -> "🇱🇹"
    "lu" -> "🇱🇺"
    "lv" -> "🇱🇻"
    "ly" -> "🇱🇾"
    "ma" -> "🇲🇦"
    "mc" -> "🇲🇨"
    "md" -> "🇲🇩"
    "me" -> "🇲🇪"
    "mf" -> "🇲🇫"
    "mg" -> "🇲🇬"
    "mh" -> "🇲🇭"
    "mk" -> "🇲🇰"
    "ml" -> "🇲🇱"
    "mm" -> "🇲🇲"
    "mn" -> "🇲🇳"
    "mo" -> "🇲🇴"
    "mp" -> "🇲🇵"
    "mq" -> "🇲🇶"
    "mr" -> "🇲🇷"
    "ms" -> "🇲🇸"
    "mt" -> "🇲🇹"
    "mu" -> "🇲🇺"
    "mv" -> "🇲🇻"
    "mw" -> "🇲🇼"
    "mx" -> "🇲🇽"
    "my" -> "🇲🇾"
    "mz" -> "🇲🇿"
    "na" -> "🇳🇦"
    "nc" -> "🇳🇨"
    "ne" -> "🇳🇪"
    "nf" -> "🇳🇫"
    "ng" -> "🇳🇬"
    "ni" -> "🇳🇮"
    "nl" -> "🇳🇱"
    "no" -> "🇳🇴"
    "np" -> "🇳🇵"
    "nr" -> "🇳🇷"
    "nu" -> "🇳🇺"
    "nz" -> "🇳🇿"
    "om" -> "🇴🇲"
    "pa" -> "🇵🇦"
    "pe" -> "🇵🇪"
    "pf" -> "🇵🇫"
    "pg" -> "🇵🇬"
    "ph" -> "🇵🇭"
    "pk" -> "🇵🇰"
    "pl" -> "🇵🇱"
    "pm" -> "🇵🇲"
    "pn" -> "🇵🇳"
    "pr" -> "🇵🇷"
    "ps" -> "🇵🇸"
    "pt" -> "🇵🇹"
    "pw" -> "🇵🇼"
    "py" -> "🇵🇾"
    "qa" -> "🇶🇦"
    "re" -> "🇷🇪"
    "ro" -> "🇷🇴"
    "rs" -> "🇷🇸"
    "ru" -> "🇷🇺"
    "rw" -> "🇷🇼"
    "sa" -> "🇸🇦"
    "sb" -> "🇸🇧"
    "sc" -> "🇸🇨"
    "sd" -> "🇸🇩"
    "se" -> "🇸🇪"
    "sg" -> "🇸🇬"
    "sh" -> "🇸🇭"
    "si" -> "🇸🇮"
    "sj" -> "🇸🇯"
    "sk" -> "🇸🇰"
    "sl" -> "🇸🇱"
    "sm" -> "🇸🇲"
    "sn" -> "🇸🇳"
    "so" -> "🇸🇴"
    "sr" -> "🇸🇷"
    "ss" -> "🇸🇸"
    "st" -> "🇸🇹"
    "sv" -> "🇸🇻"
    "sx" -> "🇸🇽"
    "sy" -> "🇸🇾"
    "sz" -> "🇸🇿"
    "tc" -> "🇹🇨"
    "td" -> "🇹🇩"
    "tf" -> "🇹🇫"
    "tg" -> "🇹🇬"
    "th" -> "🇹🇭"
    "tj" -> "🇹🇯"
    "tk" -> "🇹🇰"
    "tl" -> "🇹🇱"
    "tm" -> "🇹🇲"
    "tn" -> "🇹🇳"
    "to" -> "🇹🇴"
    "tr" -> "🇹🇷"
    "tt" -> "🇹🇹"
    "tv" -> "🇹🇻"
    "tw" -> "🇹🇼"
    "tz" -> "🇹🇿"
    "ua" -> "🇺🇦"
    "ug" -> "🇺🇬"
    "um" -> "🇺🇲"
    "us" -> "🇺🇸"
    "uy" -> "🇺🇾"
    "uz" -> "🇺🇿"
    "va" -> "🇻🇦"
    "vc" -> "🇻🇨"
    "ve" -> "🇻🇪"
    "vg" -> "🇻🇬"
    "vi" -> "🇻🇮"
    "vn" -> "🇻🇳"
    "vu" -> "🇻🇺"
    "wf" -> "🇼🇫"
    "ws" -> "🇼🇸"
    "xk" -> "🇽🇰"
    "ye" -> "🇾🇪"
    "yt" -> "🇾🇹"
    "za" -> "🇿🇦"
    "zm" -> "🇿🇲"
    "zw" -> "🇿🇼"
    else -> " "
  }
}

fun getCountriesList(): List<Country> {
  val countries = mutableListOf<Country>()
  countries.add(Country("ad", "Andorra"))
  countries.add(Country("ae", "United Arab Emirates (UAE))"))
  countries.add(Country("af", "Afghanistan"))
  countries.add(Country("ag", "Antigua and Barbuda"))
  countries.add(Country("ai", "Anguilla"))
  countries.add(Country("al", "Albania"))
  countries.add(Country("am", "Armenia"))
  countries.add(Country("ao", "Angola"))
  countries.add(Country("aq", "Antarctica"))
  countries.add(Country("ar", "Argentina"))
  countries.add(Country("as", "American Samoa"))
  countries.add(Country("at", "Austria"))
  countries.add(Country("au", "Australia"))
  countries.add(Country("aw", "Aruba"))
  countries.add(Country("ax", "Åland Islands"))
  countries.add(Country("az", "Azerbaijan"))
  countries.add(Country("ba", "Bosnia And Herzegovina"))
  countries.add(Country("bb", "Barbados"))
  countries.add(Country("bd", "Bangladesh"))
  countries.add(Country("be", "Belgium"))
  countries.add(Country("bf", "Burkina Faso"))
  countries.add(Country("bg", "Bulgaria"))
  countries.add(Country("bh", "Bahrain"))
  countries.add(Country("bi", "Burundi"))
  countries.add(Country("bj", "Benin"))
  countries.add(Country("bl", "Saint Barthélemy"))
  countries.add(Country("bm", "Bermuda"))
  countries.add(Country("bn", "Brunei Darussalam"))
  countries.add(Country("bo", "Bolivia, Plurinational State Of"))
  countries.add(Country("br", "Brazil"))
  countries.add(Country("bs", "Bahamas"))
  countries.add(Country("bt", "Bhutan"))
  countries.add(Country("bw", "Botswana"))
  countries.add(Country("by", "Belarus"))
  countries.add(Country("bz", "Belize"))
  countries.add(Country("ca", "Canada"))
  countries.add(Country("cc", "Cocos (keeling)) Islands"))
  countries.add(Country("cd", "Congo, The Democratic Republic Of The"))
  countries.add(Country("cf", "Central African Republic"))
  countries.add(Country("cg", "Congo"))
  countries.add(Country("ch", "Switzerland"))
  countries.add(Country("ci", "Côte D'ivoire"))
  countries.add(Country("ck", "Cook Islands"))
  countries.add(Country("cl", "Chile"))
  countries.add(Country("cm", "Cameroon"))
  countries.add(Country("cn", "China"))
  countries.add(Country("co", "Colombia"))
  countries.add(Country("cr", "Costa Rica"))
  countries.add(Country("cu", "Cuba"))
  countries.add(Country("cv", "Cape Verde"))
  countries.add(Country("cw", "Curaçao"))
  countries.add(Country("cx", "Christmas Island"))
  countries.add(Country("cy", "Cyprus"))
  countries.add(Country("cz", "Czech Republic"))
  countries.add(Country("de", "Germany"))
  countries.add(Country("dj", "Djibouti"))
  countries.add(Country("dk", "Denmark"))
  countries.add(Country("dm", "Dominica"))
  countries.add(Country("do", "Dominican Republic"))
  countries.add(Country("dz", "Algeria"))
  countries.add(Country("ec", "Ecuador"))
  countries.add(Country("ee", "Estonia"))
  countries.add(Country("eg", "Egypt"))
  countries.add(Country("er", "Eritrea"))
  countries.add(Country("es", "Spain"))
  countries.add(Country("et", "Ethiopia"))
  countries.add(Country("fi", "Finland"))
  countries.add(Country("fj", "Fiji"))
  countries.add(Country("fk", "Falkland Islands (malvinas))"))
  countries.add(Country("fm", "Micronesia, Federated States Of"))
  countries.add(Country("fo", "Faroe Islands"))
  countries.add(Country("fr", "France"))
  countries.add(Country("ga", "Gabon"))
  countries.add(Country("gb", "United Kingdom"))
  countries.add(Country("gd", "Grenada"))
  countries.add(Country("ge", "Georgia"))
  countries.add(Country("gf", "French Guyana"))
  countries.add(Country("gh", "Ghana"))
  countries.add(Country("gi", "Gibraltar"))
  countries.add(Country("gl", "Greenland"))
  countries.add(Country("gm", "Gambia"))
  countries.add(Country("gn", "Guinea"))
  countries.add(Country("gp", "Guadeloupe"))
  countries.add(Country("gq", "Equatorial Guinea"))
  countries.add(Country("gr", "Greece"))
  countries.add(Country("gt", "Guatemala"))
  countries.add(Country("gu", "Guam"))
  countries.add(Country("gw", "Guinea-bissau"))
  countries.add(Country("gy", "Guyana"))
  countries.add(Country("hk", "Hong Kong"))
  countries.add(Country("hn", "Honduras"))
  countries.add(Country("hr", "Croatia"))
  countries.add(Country("ht", "Haiti"))
  countries.add(Country("hu", "Hungary"))
  countries.add(Country("id", "Indonesia"))
  countries.add(Country("ie", "Ireland"))
  countries.add(Country("il", "Israel"))
  countries.add(Country("im", "Isle Of Man"))
  countries.add(Country("is", "Iceland"))
  countries.add(Country("in", "India"))
  countries.add(Country("io", "British Indian Ocean Territory"))
  countries.add(Country("iq", "Iraq"))
  countries.add(Country("ir", "Iran, Islamic Republic Of"))
  countries.add(Country("it", "Italy"))
  countries.add(Country("je", "Jersey "))
  countries.add(Country("jm", "Jamaica"))
  countries.add(Country("jo", "Jordan"))
  countries.add(Country("jp", "Japan"))
  countries.add(Country("ke", "Kenya"))
  countries.add(Country("kg", "Kyrgyzstan"))
  countries.add(Country("kh", "Cambodia"))
  countries.add(Country("ki", "Kiribati"))
  countries.add(Country("km", "Comoros"))
  countries.add(Country("kn", "Saint Kitts and Nevis"))
  countries.add(Country("kp", "North Korea"))
  countries.add(Country("kr", "South Korea"))
  countries.add(Country("kw", "Kuwait"))
  countries.add(Country("ky", "Cayman Islands"))
  countries.add(Country("kz", "Kazakhstan"))
  countries.add(Country("la", "Lao People's Democratic Republic"))
  countries.add(Country("lb", "Lebanon"))
  countries.add(Country("lc", "Saint Lucia"))
  countries.add(Country("li", "Liechtenstein"))
  countries.add(Country("lk", "Sri Lanka"))
  countries.add(Country("lr", "Liberia"))
  countries.add(Country("ls", "Lesotho"))
  countries.add(Country("lt", "Lithuania"))
  countries.add(Country("lu", "Luxembourg"))
  countries.add(Country("lv", "Latvia"))
  countries.add(Country("ly", "Libya"))
  countries.add(Country("ma", "Morocco"))
  countries.add(Country("mc", "Monaco"))
  countries.add(Country("md", "Moldova, Republic Of"))
  countries.add(Country("me", "Montenegro"))
  countries.add(Country("mf", "Saint Martin"))
  countries.add(Country("mg", "Madagascar"))
  countries.add(Country("mh", "Marshall Islands"))
  countries.add(Country("mk", "Macedonia (FYROM))"))
  countries.add(Country("ml", "Mali"))
  countries.add(Country("mm", "Myanmar"))
  countries.add(Country("mn", "Mongolia"))
  countries.add(Country("mo", "Macau"))
  countries.add(Country("mp", "Northern Mariana Islands"))
  countries.add(Country("mq", "Martinique"))
  countries.add(Country("mr", "Mauritania"))
  countries.add(Country("ms", "Montserrat"))
  countries.add(Country("mt", "Malta"))
  countries.add(Country("mu", "Mauritius"))
  countries.add(Country("mv", "Maldives"))
  countries.add(Country("mw", "Malawi"))
  countries.add(Country("mx", "Mexico"))
  countries.add(Country("my", "Malaysia"))
  countries.add(Country("mz", "Mozambique"))
  countries.add(Country("na", "Namibia"))
  countries.add(Country("nc", "New Caledonia"))
  countries.add(Country("ne", "Niger"))
  countries.add(Country("nf", "Norfolk Islands"))
  countries.add(Country("ng", "Nigeria"))
  countries.add(Country("ni", "Nicaragua"))
  countries.add(Country("nl", "Netherlands"))
  countries.add(Country("no", "Norway"))
  countries.add(Country("np", "Nepal"))
  countries.add(Country("nr", "Nauru"))
  countries.add(Country("nu", "Niue"))
  countries.add(Country("nz", "New Zealand"))
  countries.add(Country("om", "Oman"))
  countries.add(Country("pa", "Panama"))
  countries.add(Country("pe", "Peru"))
  countries.add(Country("pf", "French Polynesia"))
  countries.add(Country("pg", "Papua New Guinea"))
  countries.add(Country("ph", "Philippines"))
  countries.add(Country("pk", "Pakistan"))
  countries.add(Country("pl", "Poland"))
  countries.add(Country("pm", "Saint Pierre And Miquelon"))
  countries.add(Country("pn", "Pitcairn Islands"))
  countries.add(Country("pr", "Puerto Rico"))
  countries.add(Country("ps", "Palestine"))
  countries.add(Country("pt", "Portugal"))
  countries.add(Country("pw", "Palau"))
  countries.add(Country("py", "Paraguay"))
  countries.add(Country("qa", "Qatar"))
  countries.add(Country("re", "Réunion"))
  countries.add(Country("ro", "Romania"))
  countries.add(Country("rs", "Serbia"))
  countries.add(Country("ru", "Russian Federation"))
  countries.add(Country("rw", "Rwanda"))
  countries.add(Country("sa", "Saudi Arabia"))
  countries.add(Country("sb", "Solomon Islands"))
  countries.add(Country("sc", "Seychelles"))
  countries.add(Country("sd", "Sudan"))
  countries.add(Country("se", "Sweden"))
  countries.add(Country("sg", "Singapore"))
  countries.add(Country("sh", "Saint Helena, Ascension And Tristan Da Cunha"))
  countries.add(Country("si", "Slovenia"))
  countries.add(Country("sk", "Slovakia"))
  countries.add(Country("sl", "Sierra Leone"))
  countries.add(Country("sm", "San Marino"))
  countries.add(Country("sn", "Senegal"))
  countries.add(Country("so", "Somalia"))
  countries.add(Country("sr", "Suriname"))
  countries.add(Country("ss", "South Sudan"))
  countries.add(Country("st", "Sao Tome And Principe"))
  countries.add(Country("sv", "El Salvador"))
  countries.add(Country("sx", "Sint Maarten"))
  countries.add(Country("sy", "Syrian Arab Republic"))
  countries.add(Country("sz", "Swaziland"))
  countries.add(Country("tc", "Turks and Caicos Islands"))
  countries.add(Country("td", "Chad"))
  countries.add(Country("tg", "Togo"))
  countries.add(Country("th", "Thailand"))
  countries.add(Country("tj", "Tajikistan"))
  countries.add(Country("tk", "Tokelau"))
  countries.add(Country("tl", "Timor-leste"))
  countries.add(Country("tm", "Turkmenistan"))
  countries.add(Country("tn", "Tunisia"))
  countries.add(Country("to", "Tonga"))
  countries.add(Country("tr", "Turkey"))
  countries.add(Country("tt", "Trinidad &amp; Tobago"))
  countries.add(Country("tv", "Tuvalu"))
  countries.add(Country("tw", "Taiwan"))
  countries.add(Country("tz", "Tanzania, United Republic Of"))
  countries.add(Country("ua", "Ukraine"))
  countries.add(Country("ug", "Uganda"))
  countries.add(Country("us", "United States"))
  countries.add(Country("uy", "Uruguay"))
  countries.add(Country("uz", "Uzbekistan"))
  countries.add(Country("va", "Holy See (vatican City State))"))
  countries.add(Country("vc", "Saint Vincent &amp; The Grenadines"))
  countries.add(Country("ve", "Venezuela, Bolivarian Republic Of"))
  countries.add(Country("vg", "British Virgin Islands"))
  countries.add(Country("vi", "US Virgin Islands"))
  countries.add(Country("vn", "Vietnam"))
  countries.add(Country("vu", "Vanuatu"))
  countries.add(Country("wf", "Wallis And Futuna"))
  countries.add(Country("ws", "Samoa"))
  countries.add(Country("xk", "Kosovo"))
  countries.add(Country("ye", "Yemen"))
  countries.add(Country("yt", "Mayotte"))
  countries.add(Country("za", "South Africa"))
  countries.add(Country("zm", "Zambia"))
  countries.add(Country("zw", "Zimbabwe"))
  return countries
}