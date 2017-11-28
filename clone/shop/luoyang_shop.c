inherit SHOP;

void create()
{
	set("short", "天寰阁");
	set("long", @LONG
天寰阁是洛阳城里最著名的店铺，整个铺面装修得相当精
美雅致，显出东都洛阳繁华大方的气派。不过店里的货柜上却
空无一物，看样子已经很久没人来打理了。
LONG);
        set("open_long", @LONG
天寰阁是洛阳城里最著名的店铺，整个铺面装修得相当精
美雅致，显出东都洛阳繁华大方的气派。店铺里的伙计正招呼
着客人，忙得满头大汗。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/luoyang/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__"waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}
