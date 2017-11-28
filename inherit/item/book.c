// book.c

inherit ITEM;

int is_book() { return 1; }

string extra_long()
{
        string str;
        
        str =  "\n物品类型 : 秘籍\n";
        str += sprintf("记载内容 : %s\n", to_chinese(query("skill/name")));
        str += sprintf("经验要求 : %d\n", query("skill/exp_required"));
        str += sprintf("研习难度 : %d\n", query("skill/difficulty"));
        str += sprintf("研习要求 : %s %d 级\n", to_chinese(query("skill/name")), query("skill/min_skill"));
        str += sprintf("研习限制 : %d 级\n", query("skill/max_skill"));
        str += sprintf("精力消耗 : %d 点/次\n", query("skill/jing_cost"));
        // str += sprintf("研习方法 : 输入指令 du %s 研读。\n", query("id"));
        
        if (this_object()->query_autoload())
                str += "下线丢失 : 否\n";
        else
                str += "下线丢失 : 是\n";
        return str;
}
