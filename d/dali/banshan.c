inherit ROOM;

void create()
{
	set("short", "半山竹林");
	set("long", @LONG
一大片茂密的成年竹林生长在半山腰的缓坡上。竹子对
大理地区各民族来说是，既是重要的建筑材料，也是日常生
活用品的原材料。山下的村庄里的摆夷人经常上山来采伐竹
子。北面山上有溪流下，到这里水流已经颇大，山民经常把
砍伐下的竹子丢在溪中，任其顺水飘流，到村子附近的溪水
里再捞起来。
LONG);
	set("objects", ([
	   	__DIR__"npc/kanzhuren": 2,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    	"northup"  : __DIR__"shanjian",
	    	"east"     : __DIR__"buxiongbu",
	]));
	setup();
	replace_program(ROOM);
}

