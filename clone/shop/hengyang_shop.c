inherit SHOP;

void create()
{
	set("short", "祝融居");
	set("long", @LONG
这里是衡阳城内的一家店铺，衡阳城虽小，南岳衡山却尤
为著名。店铺由衡山五峰之一的祝融峰而得名。从红木雕窗放
眼望去，整个衡阳古城熙熙攘攘的街道尽收眼底。
LONG);
        set("open_long", @LONG
这里是衡阳城内的一家店铺，衡阳城虽小，南岳衡山却尤
为著名。店铺由衡山五峰之一的祝融峰而得名。从红木雕窗放
眼望去，整个衡阳古城熙熙攘攘的街道尽收眼底。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/henshan/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__"waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}
