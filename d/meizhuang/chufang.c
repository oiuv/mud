inherit ROOM;

void create()
{
        set("short", "厨房");
        set("long", @LONG
你顺着香味走到了梅庄的厨房，一位厨师正站在灶台后面笑眯眯
的看着你，他手上拿着一柄铁勺，用力的把锅里煮着的一大堆食物搅
匀，梅庄的弟子们如果饿了，就到这里来问这位厨师能不能吃饭，一
般来说，他们都不会遭到拒绝的。
LONG
        );
        set("exits", ([ /* sizeof() == 1 */
            "east" : __DIR__"zoulang3",
        ]));
        set("objects", ([ /* sizeof() == 1 */
            __DIR__"npc/chushi" : 1,
        ]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}


