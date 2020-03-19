// baichou.c

inherit EQUIP;

void create()
{
    set_name("白绸裙", ({ "baichou qun", "qun" }) );
	set_weight(500);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "件");
		set("armor_type", "cloth");
		set("value", 5000);
		set("armor_prop/dodge", 5);
		set("armor_prop/armor", 2);
	}
}
