inherit ROOM;

void create()
{
        set("short", "休息室");
        set("long", @LONG
这里是梅庄弟子练功劳累的时候，休息的地方，这里经常可以听
到如雷的鼾声，这里简单的放着几张垫子，几床棉被，几个枕头，而
且梅庄弟子虽然经常打扫这里，但这里仍然凌乱不堪，很多梅庄弟子
一进这里，倒头便睡，显是过于疲劳的缘故。 
LONG
        );
        set("sleep_room", 1);
        set("exits", ([
            "west" : __DIR__"zoulang2",
        ]));
        set("no_fight", 1);
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
