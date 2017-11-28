inherit SHOP;

void create()
{
	set("short", "英雄楼");
	set("long", @LONG
英雄楼本是佛山镇凤天南所开，现在却已经张罗给了别人。
整个店堂金碧辉煌，珠光宝器映得满堂生辉。不过店里的货柜
上却空无一物，看样子已经很久没人来打理了。
LONG);
        set("open_long", @LONG
英雄楼本是佛山镇凤天南所开，现在却已经张罗给了别人。
整个店堂金碧辉煌，珠光宝器映得满堂生辉。铺里人来人往川
流不息。店铺伙计正招呼着客人，忙得满头大汗。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/foshan/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__ "waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}
