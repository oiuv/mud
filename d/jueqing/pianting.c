inherit ROOM;

void create()
{
        set("short", "偏厅");
        set("long", @LONG
绝情谷内堂东侧便是偏厅，这里是谷主招呼朋友谈天喝茶
的地方。此处甚是清静，偶有一两声鸟叫伴随着淡淡香气，令
人有一种说不出的舒畅。
LONG);
        set("exits", ([
               "west"   : __DIR__"neitang",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

