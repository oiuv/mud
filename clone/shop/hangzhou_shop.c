inherit SHOP;

void create()
{
	set("short", "玉皇阁");
	set("long", @LONG
玉皇阁乃是由杭州城郊的玉皇山而得名，所谓「上有天堂
下有苏杭」，杭州城建筑别具一格，这家店铺也不例外。不过
货柜上却空无一物，看样子已很久没人来打理了。
LONG);
        set("open_long", @LONG
玉皇阁乃是由杭州城郊的玉皇山而得名，所谓「上有天堂
下有苏杭」，杭州城建筑别具一格，这家店铺也不例外。店堂
装潢得典雅精致，伙计正彬彬有礼的招呼着客人。
LONG);
	set("no_fight", 1);
	set("no_beg", 1);
	set("owner", "VOID_SHOP");
	set("exits", ([
                "down" : "/d/hangzhou/majiu",
        ]));
	set("no_steal", 1);
	set("objects", ([
                __DIR__"waiter" : 1,
        ]));
	set("no_clean_up", 0);
	set("shop_type", 0);

	setup();
}
