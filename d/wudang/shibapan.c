inherit ROOM;

void create()
{
        set("short", "十八盘");
        set("long", @LONG
这是一个很大的斜坡，俗称十八盘，大石阶一级一级笔直
而上，颇费脚力。这里坡坡有神，拐拐有祠，往上十里之后即
是灵霄宫。
LONG);
        set("exits", ([
                "northdown" : __DIR__"shiliang",
                "southup" : __DIR__"shijie2",
        ]));
        set("outdoors", "wudang");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
