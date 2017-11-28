// enchase.c
#include <ansi.h>
inherit ITEM;

int is_inlaid() { return 1; }

string chinese_s(mixed arg)
{
      if (! stringp(arg)) return "无";
      if (arg == "cold") return HIB "冰" NOR;
      if (arg == "fire") return HIR "火" NOR;
      if (arg == "magic") return HIY "魔" NOR;
      if (arg == "wind") return HIW "风" NOR;
      if (arg == "poison") return HIG "毒" NOR;
      if (arg == "lighting") return HIM "电" NOR;
}

string extra_long()
{
        string str;
        
        str = "\n物品类型 : 镶嵌物\n";
        str += sprintf("重    量 : %d\n", this_object()->query_weight());
        str += sprintf("坚    固 : %d\n", (int)query("enchase/consistence"));
        if (mapp(query("magic")))
        {  
                str += sprintf("魔力属性 : %s\n", chinese_s(query("magic/type")));              
                str += sprintf("魔 力 值 : %d\n", (int)query("magic/power"));  
        }
        // str += sprintf("使用方法 : 输入指令 enchase %s in <道具> 镶嵌。\n", query("id"));
        if (this_object()->query_autoload())
                str += "下线丢失 : 否\n";
        else
                str += "下线丢失 : 是\n";
        return str;
}
