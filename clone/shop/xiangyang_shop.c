inherit SHOP;

void create()
{
	set("short", "聚义堂");
	set("long", @LONG
聚义堂坐落于襄阳城北街，虽然襄阳连年战火不断，但店
铺内仍是布置得井井有条。堂中挂着一个大大的义字，令人肃
然起敬。货柜上却空无一物，想必是暂时停业了。
LONG);
        set("open_long", @LONG
聚义堂坐落于襄阳城北街，虽然襄阳连年战火不断，但店
铺内仍是布置得井井有条。堂中挂着一个大大的义字，令人肃
然起敬。店铺里的伙计正招呼着客人。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/xiangyang/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__"waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}
