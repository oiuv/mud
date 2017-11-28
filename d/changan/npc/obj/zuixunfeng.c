//zuixunfeng.c

#include <ansi.h>

inherit ITEM;
inherit F_LIQUID;

void create()
{
	set_name(MAG"×íÑ¬·ç"NOR, ({ "zui xunfeng", "xunfeng" }));
        set_weight(300);
	if (clonep())
        	set_default_object(__FILE__);
	else 
        {
		set("long", "Ò»ºø°ÍÊñ¼ÑÄð"MAG+"×íÑ¬·ç"NOR"£¬ÌðÃÀ´¼Ãà¡£\n");
		set("unit", "ºø");
		set("value", 500);
		set("max_liquid", 10);
	}
	set("liquid", ([
		"type": "alcohol",
		"name": MAG"×íÑ¬·ç"NOR"¼ÑÄð",
		"remaining": 25,
        	"drunk_apply": 7,
	]) );
}
