// /guanwai/houyuan.c

inherit ROOM;

void create()
{
    set("short", "后院");
    set("long", @LONG
这是胡家的后院，虽然不大，但是收拾得颇为整齐利落，看来是
有人常用心打扫的缘故。东面隐隐的传来打斗声，西面静一些。而北
面望过去是一条铺满碎石子的小路，隐隐飘来阵阵饭香。
LONG );
    set("exits", ([
        "south" : __DIR__"xiaowu",
        "north" : __DIR__"shizilu",
        "west"  : __DIR__"jingxiu",
    ]));
    set("outdoor", "guanwai");
    setup();
        replace_program(ROOM);
}
