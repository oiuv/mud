inherit SHOP;

void create()
{
	set("short", "通天阁");
	set("long", @LONG
这里是扬州城里最著名的店铺，整个铺面装修得相当精美
雅致，显出十里扬州繁华大方的气派。不过店里的货柜上却空
无一物，看样子已经很久没人来打理了。
LONG);
        set("open_long", @LONG
这里是扬州城里最热闹的店铺，铺里人来人往，川流不息。
铺面装修得精美雅致，显出十里扬州繁华大方的气派。店铺里
的伙计正招呼着客人，忙得满头大汗。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/city/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__"waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}
