// baiyubi.c

inherit ITEM;

void create()
{
	set_name("°×Óñ±Ê", ({ "baiyu bi", "bi" }));
	set_weight(300);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "Ö§");
		set("long", "¾§Ó¨ÌŞÍ¸µÄµÄºº°×Óñ×ÁÄ¥µÄ±ÊĞÎÊÎÎï¡£\n");
		set("value", 3000);
		set("material", "stone");
	}
	setup();
}
