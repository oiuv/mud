inherit ROOM;

void create()
{
        set("short", "苦寒楼一层");
        set("long", @LONG
这里是苦寒楼的底层。苦寒楼结构简单，四周为浓密的云
杉包围。取名自“梅花香自苦寒来”之意，乃是昆仑派前辈为
了激励后进昆仑派弟子而建的，往上看，长长的木楼梯盘绕而
上，似乎永无尽头。青砖地相当洁净，看来经常有人打扫。
LONG);
        set("exits", ([
                "up" : __DIR__"kuhanlou2",
                "out" : __DIR__"shanlin1",
        ]));

        setup();
        replace_program(ROOM);
}
