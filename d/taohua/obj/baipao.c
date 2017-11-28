// baipao.c

inherit EQUIP;

void create()
{
    set_name("╟веш", ({ "bai pao","pao", }) );
	set_weight(1000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "╪Ч");
		set("armor_type", "cloth");
        set("value", 200);
        set("armor_prop/dodge", 2);
	set("armor_prop/armor", 1);
	}
}
