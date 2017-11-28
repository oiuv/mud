// shenkong-xing.c 身空行
// written by That
//


inherit SKILL;

string *dodge_msg = ({
      "$n使出一招「心空」，身体向侧后飘去。\n",
      "$n使出一招「誓言空」，双足一点，跃至数丈之外。\n",
      "$n使出一招「莲空」，身形一变，滑至$N身后。\n",
      "$n大吼一声，使出一招「大安空」，从$N头顶越过。\n",
      "$n使出一招「佛空」，如轻鸿般飘去，瞬间又闪至$N面前。\n",
      "$n使出一招「金刚空」，顿时$N周围都是$n的身影。\n",
});

int valid_enable(string usage) { return (usage == "dodge") || (usage == "move");
 }

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
    return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
      if((int)me->query("qi") < 50 )
           return notify_fail("你的体力太差了，不能练身空行。\n");

      me->receive_damage("qi", 40);
      return 1;
}
