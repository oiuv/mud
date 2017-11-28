inherit ROOM;

void create()
{
	set("short", "苍山");
	set("long", @LONG
苍山之腹盛产奇石，世称大理石，且又名为点苍石、文
石、础石。石质细腻，色彩丰富，有彩花、水墨、银灰、雪
白等品种。水墨最为稀有，彩花独具特点，常用于作屏风观
赏，有云树山川、人物鸟兽之形，姿态万千，浑朴天成，为
世所宝。银灰石是精美的建筑材料，用于贴墙铺地，光润冰
亮，气若云水，消暑生凉。雪花石又名点苍白玉，晶莹可爱
白如截脂，是雕刻、绘画的好材料。天下凡此种花石皆称大
理石，大理也因此石而名扬天下。
LONG);
	set("outdoors", "dali");
	set("exits", ([
	    	"north"     : __DIR__"shilin",
	    	"east"      : __DIR__"hongsheng",
	    	"southwest" : __DIR__"xiaguan",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

