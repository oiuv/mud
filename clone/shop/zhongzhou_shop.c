inherit SHOP;

void create()
{
	set("short", "百鹤斋");
	set("long", @LONG
这里是中州城里最著名的店铺，整个铺面装修得相当精美
雅致，红木铺地，漆门雕窗，大堂正中挂着一幅百鹤图。不过
店里的货柜上却空无一物，看来已很久没人打理了。
LONG);
        set("open_long", @LONG
这里是中州城里最著名的店铺，整个铺面装修得相当精美
雅致，红木铺地，漆门雕窗，大堂正中挂着一幅百鹤图。店铺
里的伙计正招呼着客人，忙得满头大汗。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/zhongzhou/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__"waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}
