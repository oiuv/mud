// gender.c

string gender_self(string sex)
{
   return "你";
}

string gender_pronoun(string sex)
{
   switch (sex)
   {
   case "中性神":
   case "男性":
   case "无性":
      return "他";
   case "女性":
      return "她";
   case "雄性":
   case "雌性":
   default:
      return "它";
   }
}
