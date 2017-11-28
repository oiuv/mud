// weiqi.c 围棋
// cck 4/7/97

#include <armor.h>

inherit ITEM;

void create()
{
	set_name("围棋", ({ "wei qi", "weiqi", "qi", "go" }));
	set_weight(2000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "副");
		set("long",
			"这是一副围棋，棋盘用磁铁所制，棋子用铁铸成。\n");
		set("value", 5000);
		set("material", "steel");
		set("armor_prop/armor", 10 );
		}
}


