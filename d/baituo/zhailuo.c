inherit ROOM;

void create()
{
        set("short", "小宅落");
        set("long", @LONG
这里是一个树影婆娑的静谧的小宅落，当中放着一口乌黑
发亮的大水缸。白驼山上常年积雪，这里的主人架起一条长长
的竹渠，把清凉的雪水引到家中的水缸里来。
LONG);
        set("exits", ([
                "west" : __DIR__"liangong",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "baituo");
        set("resource/water", 1); 
        setup();
        replace_program(ROOM);
}
