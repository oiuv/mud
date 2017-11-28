// shijie.c
inherit ROOM;

void create()
{
        set("short", "孤山石级");
        set("long", @LONG
你向孤山边的石级上行去，一路欣赏着湖边长曳的杨柳。不知不
觉地转了几个弯，却见遍地都是梅树，老干横斜，枝叶茂密，想像初
春梅花盛开之日，香雪如海，定然观赏不尽。
LONG
        );
        set("exits", ([ /* sizeof() == 2 */
            "eastdown" : "/d/hangzhou/gushan",
            "north"    : __DIR__"xiaolu.c",
        ]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

