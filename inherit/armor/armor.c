// armor.c
#include <ansi.h>
#include <armor.h>

inherit EQUIP;

int is_armor() { return 1; }

void setup()
{
	if (! clonep(this_object()))
	        set("armor_type", TYPE_ARMOR);

        ::setup();
 }

string extra_long() 
{ 
        mapping need;
        string str; 

        str = HIW "\n物品类型 : 防具(护甲)\n" NOR; 
        if (query("bindable"))
        {
                string type;
                int t;

                t = query("bindable");
                if (t == 1) type = "装备绑定";
                else if (t == 2) type = "拾取帮定";
                else if (t == 3) type = "直接绑定";
                str += sprintf(HIW "绑定类型 : %s\n" NOR, type);
        } 
        str += sprintf(HIW "重    量 : %d\n" NOR, this_object()->query_weight());
        str += sprintf(HIW "防 护 力 : %d\n" NOR, this_object()->query("armor_prop/armor"));
        str += sprintf(HIW "镶嵌凹槽 : %d\n" NOR, (int)query("enchase/flute"));
        if (mapp(need = query("need")) && sizeof(need))
                foreach (string key in keys(need))
                        str += sprintf(HIW "装备要求 : %s %d\n" NOR,
                                       to_chinese(key), need[key]);
        /*
        str += sprintf(HIW "使用方式 : 输入指令 wear %s 装备。\n" NOR, query("id")); 
        str += sprintf(HIW "使用方式 : 输入指令 remove %s 卸下。\n" NOR, query("id")); 
        */
        str += sprintf(HIW "下线丢失 : %s\n" NOR,
                       this_object()->query_autoload() ? "否" : "是");
                       
        return str; 
} 
