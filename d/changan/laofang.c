//Room: laofang.c

inherit ROOM;

void create ()
{
	set ("short", "牢房");
	set ("long", @LONG
这是一间牢房，室内昏暗无光，只有借着一碗口大的小洞射进来的
余光，才使人视力模糊的依稀见物。西边角落里堆放着一些已经腐烂的
稻草，室内并不暗潮，甚至还有一张简陋的旧床，牢门是用一根根手臂
粗的铁棍做成的，中间有许多的空隙，室外的光线可以射进来。
LONG);
        set("exits", ([
        ]));

	setup();
        replace_program(ROOM);
}
