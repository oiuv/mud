inherit ROOM;

void create()
{
        set("short", "藏经阁");
        set("long", @LONG
小阁楼上便是峨嵋派的藏经阁了。这里都是密密麻麻，高
及顶棚的书架。窗口下有张大桌子，桌上放了几本佛经。有个
小师太正在向静道师太借书。
LONG);
        set("objects", ([
                CLASS_D("emei") + "/dao" : 1,
                __DIR__"obj/fojing1" + random(2) : 1,
                __DIR__"obj/fojing2" + random(2) : 1,
        ]));

        set("exits", ([
                "down"  : __DIR__"chuwujian", 
        ]));
        setup();
        replace_program(ROOM);
}
