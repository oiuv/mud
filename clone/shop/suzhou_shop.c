inherit SHOP;

void create()
{
	set("short", "听竹轩");
	set("long", @LONG
听竹轩坐落于苏州城北，虽称之为轩，实际却是一间装潢
雅致的店铺。苏州城建筑别具一格，这家店铺也不例外。不过
货柜上却空无一物，看样子已很久没人来打理了。
LONG);
        set("open_long", @LONG
听竹轩坐落于苏州城北，虽称之为轩，实际却是一间装潢
雅致的店铺。苏州城建筑别具一格，这家店铺也不例外。此时
店堂伙计正忙上忙下，招呼着客人。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/suzhou/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__"waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}

