// wuji1.c

inherit BOOK;

string* titles = ({
	"风云手手法",
	"如来千叶手手法",
	"大金刚拳法",
	"罗汉拳法",
	"般若掌法",
	"散花掌法",
});

string* skills = ({
	"fengyun-shou",
	"qianye-shou",
	"jingang-quan",
	"luohan-quan",
	"banruo-zhang",
	"sanhua-zhang",
});

void create()
{
	int i = random(sizeof(titles));

	set_name(titles[i], ({ "shaolin wuji", "wuji" }));
	set_weight(200);
	set("unit", "册");
	set("long", "这是一册" + titles[i] + "\n");
	set("value", 500);
	set("material", "paper");
	set("skill", ([
			"name":	skills[i],	// name of the skill
			"exp_required":	10000,	// minimum combat experience required
			"jing_cost": 15+random(30),// jing cost every time study this
			"difficulty":	25,	// the base int to learn this skill
			"max_skill":	99	// the maximum level you can learn
		      ]) );
}
