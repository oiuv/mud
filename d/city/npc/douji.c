// by ivy on 2013年11月3日 10:07:39
inherit NPC;
/*
int random2 (int i)
{
  return random(i) % i;
}
*/
void create()
{
  set_name("斗鸡", ({ "dou ji", "ji" }) );
  set("race", "野兽");
  set("gender", "雄性");
  set("age", 2);
  set("long", "一只雄赳赳的斗鸡。\n");
  set("attitude", "friendly");
  set("max_qi",50);
  set("max_jing",50);
  set("str", 10);
  set("int", 5);
  set("con", 5);
  set("dex", 10+random(3));
  set_skill("unarmed", random(5)+20);
  set_skill("dodge", random(5)+20);
  set_skill("parry", random(5)+20);
  set("limbs", ({ "头部", "身体", "尾巴" }) );
  set("verbs", ({ "poke"}) );

  // slow down the douji process.
  set("allow_heal_up",1);

  setup();
}

