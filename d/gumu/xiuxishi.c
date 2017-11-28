
inherit ROOM;

void create()
{
        set("short", "休息室");
        set("long", @LONG
这是间很大的房间，光线非常昏暗。房里没有什么别的东
西，只有中间放着一张收拾得舒舒服服的大床，床上的被褥也
整理得整整洁洁，看着就让人想睡觉。
LONG
        );

        set("exits", ([
                "southeast" : __DIR__"xiaowu1",
        ]));

        set("sleep_room",1);
        set("no_fight",1);
        set("no_steal",1);

        setup();
        replace_program(ROOM);
}
