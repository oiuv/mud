// force-book.c

inherit ITEM;

string* titles = ({
		 "昆仑派秘籍",
});

void create()
{
		  set_name(titles[random(sizeof(titles))], ({ "shu", "book" }));
		  set_weight(200);
		  if( clonep() )
					 set_default_object(__FILE__);
		  else {
		  set("unit", "本");
		  set("long", "这是昆仑派内功心法的秘籍。\n");
		  set("value", 500);
		  set("material", "paper");
		  set("skill", ([
		  "name": "force",     // name of the skill
		  "exp_required": 1000,      // minimum combat experience required
		  "jing_cost":    15,     // jing cost every time study this
		  "difficulty":   20,     // the base int to learn this skill
		  "max_skill":    41      // the maximum level you learn
					 ]) );
		  }
}
