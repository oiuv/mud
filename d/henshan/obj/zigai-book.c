#include <ansi.h>
inherit ITEM;

void create()
{
    	set_name(HIY "¡¸×Ï¸Ç½£Æ×¡¹" NOR, ({ "zigai jianpu", "jianpu", "zigai", "pu"}));
        set_weight(600);
        if (clonep())
        	destruct(this_object());
        else{
        	set("unit", "±¾");
        	set("long", HIY "·âÃæÉÏÐ´Öø¡¸×Ï¸Ç½£Æ×¡¹¡£\n" NOR);
        	set("value", 1);
		set("no_sell", 1);
        	set("material", "paper");
        	set("skill", ([
            		"name"         :  "zigai-jian",        
            		"exp_required" :  10000,          
            		"jing_cost"    :  20,         
            		"difficulty"   :  20,
            		"max_skill"    :  120
        	]));

       }
}
