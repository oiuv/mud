## 说明

    中文汉字及词典相关处理进程

## 继承

    inherit F_SAVE;

## 属性

    nosave string *c_digit = ({"零", "十", "百", "千", "万", "亿", "兆"});
    nosave string *c_num = ({"零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"});
    nosave string *sym_tian = ({"甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"});
    nosave string *sym_di = ({"子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"});
    mapping dict = ([]);

## 方法

    void remove();
    string chinese_number(int i);
    string query_save_file();
    string chinese(string str);
    string find_skill(string value);
    void remove_translate(string key);
    void add_translate(string key, string chn);
    void dump_translate();
    string chinese_date(int date, int year);
    string chinese_month(int date);
    string chinese_monthday(int date);
    int check_control(string name);
    int check_space(string name);
    int check_return(string name);
    int check_chinese(string name);
    int check_length(string str);
