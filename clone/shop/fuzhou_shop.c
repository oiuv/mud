inherit SHOP;

void create()
{
	set("short", "腾龙斋");
	set("long", @LONG
腾龙斋是福州城内有名的店铺，店堂正中挂着的一块匾额
上写着「腾蛟起风」四个大字，令人肃然起敬。不过店里的货
柜上却空无一物，看样子已经很久没人来打理了。
LONG);
        set("open_long", @LONG
腾龙斋是福州城内有名的店铺，店堂正中挂着的一块匾额
上写着「腾蛟起风」四个大字，令人肃然起敬。整个铺面宽敞
明亮，柜上摆满了各式各样、琳琅满目的货物。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/fuzhou/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__"waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}
